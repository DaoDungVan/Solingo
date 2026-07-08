import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  lessonsApi,
  type DictationFeedback,
  type FillBlankFeedback,
  type GradeResult,
  type Item,
  type Lesson,
} from '@/api/lessons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { speak, stopSpeaking } from '@/lib/speak';

export default function LessonPlayer() {
  const c = useTheme();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [blanks, setBlanks] = useState<string[]>([]);
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
      .catch((err) => setError(err?.response?.data?.error ?? 'Không tải được bài học'));
    return () => stopSpeaking();
  }, [id]);

  const item = items?.[index];
  const blankCount = useMemo(
    () => (item?.display ? item.display.split('___').length - 1 : 0),
    [item]
  );

  // Đọc câu tự động khi sang câu mới.
  useEffect(() => {
    if (item) speak(item.text);
  }, [item?.id]);

  async function onSubmit() {
    if (!item) return;
    setSubmitting(true);
    try {
      const answer = item.kind === 'fill_blank' ? { blanks } : { text };
      const res = await lessonsApi.submit(item.id, answer);
      setResult(res.data);
      setScores((s) => [...s, res.data.score]);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Không chấm được bài');
    } finally {
      setSubmitting(false);
    }
  }

  function onNext() {
    stopSpeaking();
    setResult(null);
    setText('');
    setBlanks([]);
    if (items && index + 1 < items.length) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
      refreshUser().catch(() => {}); // cập nhật XP trên Trang chủ
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
    item.kind === 'fill_blank'
      ? blanks.some((b) => b?.trim())
      : text.trim().length > 0;

  return (
    <>
      <Stack.Screen options={{ title: lesson?.title ?? 'Bài học' }} />
      <ScrollView
        style={{ backgroundColor: c.background }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.progress, { color: c.textSecondary }]}>
          Câu {index + 1}/{items.length}
        </Text>

        {/* Nút phát audio */}
        <View style={styles.audioRow}>
          <Pressable
            onPress={() => speak(item.text)}
            style={({ pressed }) => [
              styles.playBtn,
              { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 },
            ]}>
            <Ionicons name="volume-high" size={30} color={c.onPrimary} />
          </Pressable>
          <Pressable
            onPress={() => speak(item.text, { rate: 0.5 })}
            style={({ pressed }) => [
              styles.slowBtn,
              { borderColor: c.border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="hourglass-outline" size={16} color={c.textSecondary} />
            <Text style={{ color: c.textSecondary, fontSize: 13 }}>Chậm</Text>
          </Pressable>
        </View>

        {item.kind === 'fill_blank' ? (
          <FillBlankInput
            display={item.display ?? ''}
            blankCount={blankCount}
            blanks={blanks}
            setBlanks={setBlanks}
            disabled={!!result}
          />
        ) : (
          <TextInput
            value={text}
            onChangeText={setText}
            editable={!result}
            placeholder="Gõ lại câu bạn nghe được…"
            placeholderTextColor={c.textSecondary}
            multiline
            style={[
              styles.input,
              { color: c.text, backgroundColor: c.backgroundElement, borderColor: c.border },
            ]}
          />
        )}

        {item.hint && !result ? (
          <Text style={{ color: c.textSecondary, fontStyle: 'italic' }}>💡 {item.hint}</Text>
        ) : null}

        {result ? (
          <ResultView result={result} kind={item.kind} />
        ) : (
          <Button title="Kiểm tra" onPress={onSubmit} loading={submitting} disabled={!canSubmit} />
        )}

        {result ? (
          <Button
            title={index + 1 < items.length ? 'Câu tiếp theo' : 'Hoàn thành'}
            onPress={onNext}
          />
        ) : null}
      </ScrollView>
    </>
  );
}

function FillBlankInput({
  display,
  blankCount,
  blanks,
  setBlanks,
  disabled,
}: {
  display: string;
  blankCount: number;
  blanks: string[];
  setBlanks: (b: string[]) => void;
  disabled: boolean;
}) {
  const c = useTheme();
  const parts = display.split('___');
  let blankIdx = -1;

  return (
    <View style={styles.fillWrap}>
      {parts.map((part, i) => {
        const nodes = [
          <Text key={`t${i}`} style={[styles.fillText, { color: c.text }]}>
            {part}
          </Text>,
        ];
        if (i < parts.length - 1) {
          blankIdx += 1;
          const bi = blankIdx;
          nodes.push(
            <TextInput
              key={`b${i}`}
              value={blanks[bi] ?? ''}
              editable={!disabled}
              onChangeText={(v) => {
                const next = [...blanks];
                next[bi] = v;
                setBlanks(next);
              }}
              placeholder="…"
              placeholderTextColor={c.textSecondary}
              style={[styles.blankInput, { color: c.primary, borderColor: c.primary }]}
            />
          );
        }
        return nodes;
      })}
    </View>
  );
}

function ResultView({ result, kind }: { result: GradeResult; kind: Item['kind'] }) {
  const c = useTheme();
  const color = result.isCorrect ? c.success : result.score > 0 ? '#D97706' : c.danger;

  return (
    <View style={[styles.resultBox, { backgroundColor: c.backgroundElement }]}>
      <View style={styles.resultHeader}>
        <Ionicons
          name={result.isCorrect ? 'checkmark-circle' : 'alert-circle'}
          size={22}
          color={color}
        />
        <Text style={[styles.resultScore, { color }]}>
          {result.isCorrect ? 'Chính xác!' : `Đúng ${result.score}%`}
        </Text>
        {result.xpGain > 0 ? (
          <Text style={{ color: c.primary, fontWeight: '700' }}>+{result.xpGain} XP</Text>
        ) : null}
      </View>

      {kind === 'fill_blank' ? (
        <View style={{ gap: 4 }}>
          {(result.feedback as FillBlankFeedback).blanks.map((b, i) => (
            <Text key={i} style={{ color: c.text }}>
              {b.correct ? '✓' : '✗'} {b.given || '(trống)'}
              {!b.correct ? <Text style={{ color: c.success }}> → {b.expected}</Text> : null}
            </Text>
          ))}
        </View>
      ) : (
        <View style={styles.wordsWrap}>
          {(result.feedback as DictationFeedback).words.map((w, i) => (
            <Text
              key={i}
              style={[styles.word, { color: w.correct ? c.success : c.danger }]}>
              {w.word}
            </Text>
          ))}
        </View>
      )}

      {kind === 'dictation' ? (
        <Text style={{ color: c.textSecondary, marginTop: 8 }}>
          Đáp án: <Text style={{ color: c.text }}>{(result.feedback as DictationFeedback).expected}</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  container: { padding: 20, gap: 18 },
  progress: { fontSize: 13, fontWeight: '600' },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  playBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  slowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: { minHeight: 90, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  fillWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  fillText: { fontSize: 18, lineHeight: 34 },
  blankInput: {
    minWidth: 70,
    borderBottomWidth: 2,
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 2,
    fontWeight: '600',
  },
  resultBox: { borderRadius: 14, padding: 16, gap: 8 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultScore: { fontSize: 16, fontWeight: '700', flex: 1 },
  wordsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  word: { fontSize: 16, fontWeight: '600' },
  finishTitle: { fontSize: 24, fontWeight: '800' },
});
