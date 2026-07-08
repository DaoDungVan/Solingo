import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { vocabApi, type VocabCard } from '@/api/vocab';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { speak } from '@/lib/speak';

const RATINGS: { q: 0 | 1 | 2 | 3; label: string; color: string }[] = [
  { q: 0, label: 'Lại', color: '#DC2626' },
  { q: 1, label: 'Khó', color: '#D97706' },
  { q: 2, label: 'Tốt', color: '#16A34A' },
  { q: 3, label: 'Dễ', color: '#2563EB' },
];

export default function VocabScreen() {
  const c = useTheme();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [queue, setQueue] = useState<VocabCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    vocabApi
      .study(user?.level ?? 'A1')
      .then((res) => setQueue(res.data.queue))
      .catch((err) => setError(err?.response?.data?.error ?? 'Không tải được từ vựng'));
  }, [user?.level]);

  const card = queue?.[index];

  // Đọc từ khi lật sang mặt sau.
  useEffect(() => {
    if (flipped && card) speak(card.word);
  }, [flipped, card?.id]);

  async function rate(q: 0 | 1 | 2 | 3) {
    if (!card) return;
    setSaving(true);
    try {
      await vocabApi.review(card.id, q);
      if (queue && index + 1 < queue.length) {
        setIndex((i) => i + 1);
        setFlipped(false);
      } else {
        setDone(true);
        refreshUser().catch(() => {});
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Không lưu được');
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.danger }}>{error}</Text>
      </View>
    );
  }
  if (!queue) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }
  if (queue.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Ionicons name="checkmark-done-circle" size={56} color={c.success} />
        <Text style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>Hết từ cần ôn hôm nay!</Text>
        <Text style={{ color: c.textSecondary, textAlign: 'center' }}>Quay lại sau để ôn tiếp nhé.</Text>
        <View style={{ height: 16 }} />
        <Button title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }
  if (done) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Ionicons name="trophy" size={56} color={c.primary} />
        <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>Hoàn thành {queue.length} từ!</Text>
        <View style={{ height: 16 }} />
        <Button title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.progress, { color: c.textSecondary }]}>
        {index + 1}/{queue.length}
        {card?.is_new ? '  ·  từ mới' : ''}
      </Text>

      {/* Thẻ lật */}
      <Pressable
        onPress={() => setFlipped((f) => !f)}
        style={[styles.card, { backgroundColor: c.backgroundElement, borderColor: c.border }]}>
        <Text style={[styles.word, { color: c.text }]}>{card?.word}</Text>
        {card?.ipa ? <Text style={[styles.ipa, { color: c.textSecondary }]}>{card.ipa}</Text> : null}

        {flipped ? (
          <View style={styles.back}>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Text style={[styles.meaning, { color: c.primary }]}>{card?.meaning}</Text>
            {card?.example ? (
              <Text style={[styles.example, { color: c.textSecondary }]}>"{card.example}"</Text>
            ) : null}
          </View>
        ) : (
          <Text style={[styles.tapHint, { color: c.textSecondary }]}>Chạm để xem nghĩa</Text>
        )}

        <Pressable onPress={() => card && speak(card.word)} style={styles.speaker} hitSlop={12}>
          <Ionicons name="volume-high" size={22} color={c.primary} />
        </Pressable>
      </Pressable>

      {/* Nút đánh giá — chỉ hiện khi đã lật */}
      {flipped ? (
        <View style={styles.ratings}>
          {RATINGS.map((r) => (
            <Pressable
              key={r.q}
              disabled={saving}
              onPress={() => rate(r.q)}
              style={({ pressed }) => [
                styles.rateBtn,
                { backgroundColor: r.color, opacity: saving ? 0.6 : pressed ? 0.85 : 1 },
              ]}>
              <Text style={styles.rateLabel}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Button title="Xem nghĩa" onPress={() => setFlipped(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  container: { flex: 1, padding: 20, gap: 20 },
  progress: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  word: { fontSize: 34, fontWeight: '800' },
  ipa: { fontSize: 16 },
  tapHint: { marginTop: 16, fontSize: 13 },
  back: { alignItems: 'center', gap: 12, marginTop: 12, alignSelf: 'stretch' },
  divider: { height: 1, alignSelf: 'stretch' },
  meaning: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  example: { fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
  speaker: { position: 'absolute', top: 16, right: 16 },
  ratings: { flexDirection: 'row', gap: 10 },
  rateBtn: { flex: 1, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rateLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
