import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { lessonsApi, type Lesson } from '@/api/lessons';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function GrammarHub() {
  const c = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lessonsApi
      .list('grammar', user?.level)
      .then((res) => setLessons(res.data.lessons))
      .catch((err) => setError(err?.response?.data?.error ?? 'Không tải được bài'));
  }, [user?.level]);

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      {/* Học từ vựng (SRS) */}
      <Pressable
        onPress={() => router.push('/(app)/practice/vocab')}
        style={({ pressed }) => [
          styles.vocabCard,
          { backgroundColor: c.primary, opacity: pressed ? 0.9 : 1 },
        ]}>
        <View style={[styles.iconCircle, { backgroundColor: '#ffffff33' }]}>
          <Ionicons name="albums" size={26} color={c.onPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.vocabTitle, { color: c.onPrimary }]}>Học từ vựng</Text>
          <Text style={{ color: '#ffffffcc', fontSize: 13 }}>Flashcard ôn theo lịch thông minh</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={c.onPrimary} />
      </Pressable>

      <Text style={[styles.section, { color: c.text }]}>Bài ngữ pháp</Text>

      {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
      {!lessons ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: 20 }} />
      ) : lessons.length === 0 ? (
        <Text style={{ color: c.textSecondary }}>Chưa có bài cho trình độ {user?.level}.</Text>
      ) : (
        lessons.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => router.push({ pathname: '/(app)/practice/quiz/[id]', params: { id: l.id } })}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: c.backgroundElement, opacity: pressed ? 0.85 : 1 },
            ]}>
            <View style={[styles.levelBadge, { backgroundColor: c.primary + '22' }]}>
              <Text style={[styles.levelText, { color: c.primary }]}>{l.level}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: c.text }]}>{l.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  vocabCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, gap: 14 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  vocabTitle: { fontSize: 18, fontWeight: '800' },
  section: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, gap: 12 },
  levelBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  levelText: { fontSize: 12, fontWeight: '700' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
});
