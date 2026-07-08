import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { lessonsApi, type Lesson } from '@/api/lessons';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function DictationLessonList() {
  const c = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lọc bài theo trình độ người dùng đã chọn khi onboarding.
    lessonsApi
      .list('dictation', user?.level)
      .then((res) => setLessons(res.data.lessons))
      .catch((err) => setError(err?.response?.data?.error ?? 'Không tải được danh sách bài'));
  }, [user?.level]);

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.danger }}>{error}</Text>
      </View>
    );
  }

  if (!lessons) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (lessons.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Ionicons name="file-tray-outline" size={44} color={c.textSecondary} />
        <Text style={{ color: c.textSecondary, textAlign: 'center' }}>
          Chưa có bài nào cho trình độ {user?.level}. Nội dung sẽ được bổ sung thêm.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      {lessons.map((l) => (
        <Pressable
          key={l.id}
          onPress={() => router.push({ pathname: '/(app)/practice/lesson/[id]', params: { id: l.id } })}
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
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  container: { padding: 20, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, gap: 12 },
  levelBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  levelText: { fontSize: 12, fontWeight: '700' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
});
