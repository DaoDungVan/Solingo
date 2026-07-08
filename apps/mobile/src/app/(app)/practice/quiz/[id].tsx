import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  lessonsApi,
  type ChoiceFeedback,
  type DictationFeedback,
  type GradeResult,
  type Item,
  type Lesson,
  type WriteFeedback,
} from '@/api/lessons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function QuizPlayer() {
  const c = useTheme();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const [choice, setChoice] = useState<string | null>(null);
  const [tiles, setTiles] = useState<string[]>([]); // reorder: các từ đã chọn (theo thứ tự)
  const [writeText, setWriteText] = useState(''); // write: câu người dùng viết
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    lessonsApi
      .items(id)
      .then((res) => {
        setLesson(res.data.lesson);
        setItems(res.data.items);
      })
      .catch((err) => setError(err?.response?.data?.error ?? 'Không tải được bài'));
  }, [id]);

  const item = items?.[index];
  // Các từ còn lại để chọn (reorder): options trừ đi các tile đã chọn (theo số lượng).
  const remaining = useMemo(() => {
    if (!item?.options) return [];
    const used = [...tiles];
    const rem: { word: string; i: number }[] = [];
    item.options.forEach((w, i) => {
      const at = used.indexOf(w);
      if (at >= 0) used.splice(at, 1);
      else rem.push({ word: w, i });
    });
    return rem;
  }, [item, tiles]);

  async function onSubmit() {
    if (!item) return;
    setSubmitting(true);
    try {
      const answer =
        item.kind === 'mcq'
          ? { choice: choice ?? '' }
          : item.kind === 'write'
            ? { text: writeText }
            : { text: tiles.join(' ') };
      const res = await lessonsApi.submit(item.id, answer);
      setResult(res.data);
      setScores((s) => [...s, res.data.score]);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Không chấm được');
    } finally {
      setSubmitting(false);
    }
  }

  function onNext() {
    setResult(null);
    setChoice(null);
    setTiles([]);
    setWriteText('');
    if (items && index + 1 < items.length) setIndex((i) => i + 1);
    else {
      setFinished(true);
      refreshUser().catch(() => {});
    }
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.danger }}>{error}</Text>
      </View>
    );
  }
  if (!items || !item) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }
  if (finished) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Ionicons name="checkmark-circle" size={64} color={c.success} />
        <Text style={[styles.finishTitle, { color: c.text }]}>Hoàn thành bài!</Text>
        <Text style={{ color: c.textSecondary, fontSize: 16 }}>Điểm trung bình: {avg}/100</Text>
        <View style={{ height: 24 }} />
        <Button title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }

  const canSubmit =
    item.kind === 'mcq' ? !!choice : item.kind === 'write' ? writeText.trim().length > 0 : tiles.length > 0;

  return (
    <>
      <Stack.Screen options={{ title: lesson?.title ?? 'Ngữ pháp' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.progress, { color: c.textSecondary }]}>
          Câu {index + 1}/{items.length}
        </Text>

        {item.kind === 'mcq' ? (
          <>
            <Text style={[styles.question, { color: c.text }]}>{item.text}</Text>
            <View style={{ gap: 10 }}>
              {item.options?.map((opt) => {
                const selected = choice === opt;
                const correctAns = result && (result.feedback as ChoiceFeedback).expected;
                let bg: string = c.backgroundElement;
                let border: string = selected ? c.primary : c.border;
                if (result) {
                  if (opt === correctAns) { bg = c.success + '22'; border = c.success; }
                  else if (selected) { bg = c.danger + '22'; border = c.danger; }
                }
                return (
                  <Pressable
                    key={opt}
                    disabled={!!result}
                    onPress={() => setChoice(opt)}
                    style={[styles.option, { backgroundColor: bg, borderColor: border }]}>
                    <Text style={{ color: c.text, fontSize: 16 }}>{opt}</Text>
                    {result && opt === correctAns ? (
                      <Ionicons name="checkmark" size={20} color={c.success} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : item.kind === 'write' ? (
          <>
            <Text style={[styles.question, { color: c.text }]}>{item.text}</Text>
            <TextInput
              value={writeText}
              onChangeText={setWriteText}
              editable={!result}
              placeholder="Viết câu tiếng Anh của bạn…"
              placeholderTextColor={c.textSecondary}
              multiline
              style={[
                styles.writeInput,
                { color: c.text, backgroundColor: c.backgroundElement, borderColor: c.border },
              ]}
            />
          </>
        ) : (
          <>
            <Text style={[styles.question, { color: c.text }]}>
              {item.display || 'Sắp xếp thành câu đúng:'}
            </Text>
            {/* Vùng câu đang ghép */}
            <View style={[styles.answerArea, { borderColor: c.border }]}>
              {tiles.length === 0 ? (
                <Text style={{ color: c.textSecondary }}>Chạm các từ bên dưới…</Text>
              ) : (
                tiles.map((w, i) => (
                  <Pressable
                    key={`${w}-${i}`}
                    disabled={!!result}
                    onPress={() => setTiles((t) => t.filter((_, idx) => idx !== i))}
                    style={[styles.tile, { backgroundColor: c.primary }]}>
                    <Text style={{ color: c.onPrimary, fontWeight: '600' }}>{w}</Text>
                  </Pressable>
                ))
              )}
            </View>
            {/* Kho từ */}
            <View style={styles.pool}>
              {remaining.map(({ word, i }) => (
                <Pressable
                  key={`${word}-${i}`}
                  disabled={!!result}
                  onPress={() => setTiles((t) => [...t, word])}
                  style={[styles.tile, { backgroundColor: c.backgroundElement, borderColor: c.border, borderWidth: 1 }]}>
                  <Text style={{ color: c.text, fontWeight: '600' }}>{word}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {item.hint && !result ? (
          <Text style={{ color: c.textSecondary, fontStyle: 'italic' }}>💡 {item.hint}</Text>
        ) : null}

        {result ? <ResultView result={result} kind={item.kind} /> : (
          <Button title="Kiểm tra" onPress={onSubmit} loading={submitting} disabled={!canSubmit} />
        )}

        {result ? (
          <Button title={index + 1 < items.length ? 'Câu tiếp theo' : 'Hoàn thành'} onPress={onNext} />
        ) : null}
      </ScrollView>
    </>
  );
}

function ResultView({ result, kind }: { result: GradeResult; kind: Item['kind'] }) {
  const c = useTheme();
  const color = result.isCorrect ? c.success : result.score > 0 ? '#D97706' : c.danger;
  return (
    <View style={[styles.resultBox, { backgroundColor: c.backgroundElement }]}>
      <View style={styles.resultHeader}>
        <Ionicons name={result.isCorrect ? 'checkmark-circle' : 'alert-circle'} size={22} color={color} />
        <Text style={[styles.resultScore, { color }]}>
          {result.isCorrect ? 'Chính xác!' : `Đúng ${result.score}%`}
        </Text>
        {result.xpGain > 0 ? (
          <Text style={{ color: c.primary, fontWeight: '700' }}>+{result.xpGain} XP</Text>
        ) : null}
      </View>
      {kind === 'reorder' && !result.isCorrect ? (
        <Text style={{ color: c.textSecondary }}>
          Đáp án:{' '}
          <Text style={{ color: c.text }}>{(result.feedback as DictationFeedback).expected}</Text>
        </Text>
      ) : null}
      {kind === 'write' ? (
        <View style={{ gap: 6 }}>
          {(result.feedback as WriteFeedback).corrected ? (
            <Text style={{ color: c.textSecondary }}>
              Gợi ý:{' '}
              <Text style={{ color: c.text, fontWeight: '600' }}>
                {(result.feedback as WriteFeedback).corrected}
              </Text>
            </Text>
          ) : null}
          {(result.feedback as WriteFeedback).explanation ? (
            <Text style={{ color: c.text }}>{(result.feedback as WriteFeedback).explanation}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  container: { padding: 20, gap: 18 },
  progress: { fontSize: 13, fontWeight: '600' },
  question: { fontSize: 20, fontWeight: '700', lineHeight: 30 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 16,
  },
  answerArea: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  writeInput: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  resultBox: { borderRadius: 14, padding: 16, gap: 8 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultScore: { fontSize: 16, fontWeight: '700', flex: 1 },
  finishTitle: { fontSize: 24, fontWeight: '800' },
});
