import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  lessonsApi,
  type DictationFeedback,
  type GradeResult,
  type Item,
  type Lesson,
} from '@/api/lessons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { speak, stopSpeaking } from '@/lib/speak';

export default function ShadowPlayer() {
  const c = useTheme();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { supported, listening, transcript, error: srError, start, stop, reset } =
    useSpeechRecognition('en-US');

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
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

  useEffect(() => {
    if (item) speak(item.text);
  }, [item?.id]);

  async function onSubmit() {
    if (!item || !transcript) return;
    setSubmitting(true);
    try {
      const res = await lessonsApi.submit(item.id, { text: transcript });
      setResult(res.data);
      setScores((s) => [...s, res.data.score]);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Không chấm được');
    } finally {
      setSubmitting(false);
    }
  }

  function onNext() {
    stop();
    stopSpeaking();
    reset();
    setResult(null);
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

  return (
    <>
      <Stack.Screen options={{ title: lesson?.title ?? 'Nghe & Nói' }} />
      <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
        <Text style={[styles.progress, { color: c.textSecondary }]}>
          Câu {index + 1}/{items.length}
        </Text>

        {/* Câu mẫu + nghe */}
        <View style={[styles.sentenceBox, { backgroundColor: c.backgroundElement }]}>
          <Text style={[styles.sentence, { color: c.text }]}>{item.text}</Text>
          <Pressable onPress={() => speak(item.text)} hitSlop={12} style={styles.playBtn}>
            <Ionicons name="volume-high" size={24} color={c.primary} />
          </Pressable>
        </View>

        {!supported ? (
          <View style={[styles.warn, { borderColor: c.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={c.textSecondary} />
            <Text style={{ color: c.textSecondary, flex: 1 }}>
              Nhận giọng nói cần trình duyệt Chrome/Edge (hoặc bản build app riêng). Hãy mở bằng Chrome để luyện nói.
            </Text>
          </View>
        ) : (
          <>
            {/* Nút thu âm */}
            <View style={styles.micWrap}>
              <Pressable
                onPress={() => (listening ? stop() : start())}
                disabled={!!result}
                style={({ pressed }) => [
                  styles.micBtn,
                  {
                    backgroundColor: listening ? c.danger : c.primary,
                    opacity: result ? 0.5 : pressed ? 0.85 : 1,
                  },
                ]}>
                <Ionicons name={listening ? 'stop' : 'mic'} size={34} color={c.onPrimary} />
              </Pressable>
              <Text style={{ color: c.textSecondary }}>
                {listening ? 'Đang nghe… chạm để dừng' : 'Chạm để nói'}
              </Text>
            </View>

            {transcript ? (
              <View style={[styles.transcriptBox, { backgroundColor: c.backgroundElement }]}>
                <Text style={{ color: c.textSecondary, fontSize: 12 }}>Bạn nói:</Text>
                <Text style={{ color: c.text, fontSize: 16 }}>{transcript}</Text>
              </View>
            ) : null}

            {srError ? <Text style={{ color: c.danger }}>{srError}</Text> : null}

            {result ? (
              <ResultView result={result} />
            ) : (
              <Button
                title="Kiểm tra"
                onPress={onSubmit}
                loading={submitting}
                disabled={!transcript || listening}
              />
            )}
          </>
        )}

        {result ? (
          <Button title={index + 1 < items.length ? 'Câu tiếp theo' : 'Hoàn thành'} onPress={onNext} />
        ) : null}
      </ScrollView>
    </>
  );
}

function ResultView({ result }: { result: GradeResult }) {
  const c = useTheme();
  const color = result.isCorrect ? c.success : result.score > 0 ? '#D97706' : c.danger;
  const fb = result.feedback as DictationFeedback;
  return (
    <View style={[styles.resultBox, { backgroundColor: c.backgroundElement }]}>
      <View style={styles.resultHeader}>
        <Ionicons name={result.isCorrect ? 'checkmark-circle' : 'alert-circle'} size={22} color={color} />
        <Text style={[styles.resultScore, { color }]}>
          {result.isCorrect ? 'Phát âm rõ!' : `Khớp ${result.score}%`}
        </Text>
        {result.xpGain > 0 ? (
          <Text style={{ color: c.primary, fontWeight: '700' }}>+{result.xpGain} XP</Text>
        ) : null}
      </View>
      <View style={styles.wordsWrap}>
        {fb.words.map((w, i) => (
          <Text key={i} style={[styles.word, { color: w.correct ? c.success : c.danger }]}>
            {w.word}
          </Text>
        ))}
      </View>
      <Text style={{ color: c.textSecondary, marginTop: 4, fontSize: 13 }}>
        Từ màu đỏ là chỗ máy chưa nghe rõ — thử phát âm lại nhé.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  container: { padding: 20, gap: 20 },
  progress: { fontSize: 13, fontWeight: '600' },
  sentenceBox: { borderRadius: 16, padding: 20, paddingRight: 52 },
  sentence: { fontSize: 22, fontWeight: '700', lineHeight: 32 },
  playBtn: { position: 'absolute', top: 16, right: 16 },
  warn: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  micWrap: { alignItems: 'center', gap: 10, marginVertical: 8 },
  micBtn: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  transcriptBox: { borderRadius: 12, padding: 14, gap: 4 },
  resultBox: { borderRadius: 14, padding: 16, gap: 8 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultScore: { fontSize: 16, fontWeight: '700', flex: 1 },
  wordsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  word: { fontSize: 16, fontWeight: '600' },
  finishTitle: { fontSize: 24, fontWeight: '800' },
});
