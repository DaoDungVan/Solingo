import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { progressApi, type Progress } from '@/api/progress';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { PRACTICE_MODES } from '@/features/practice/modes';
import { PracticeCard } from '@/features/practice/practice-card';

export default function HomeScreen() {
  const c = useTheme();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);

  // Mỗi lần quay lại Trang chủ: làm mới user (streak/XP) + tiến độ.
  useFocusEffect(
    useCallback(() => {
      refreshUser().catch(() => {});
      progressApi
        .get()
        .then((res) => setProgress(res.data))
        .catch(() => {});
    }, [])
  );

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.hello, { color: c.text }]}>
        Chào {user?.display_name || 'bạn'} 👋
      </Text>

      <View style={styles.statsRow}>
        <StatCard icon="flame" value={`${user?.streak ?? 0}`} label="Chuỗi ngày" />
        <StatCard icon="star" value={`${user?.xp ?? 0}`} label="Điểm XP" />
        <StatCard icon="ribbon" value={user?.level ?? 'A1'} label="Trình độ" />
      </View>

      {progress ? <WeekActivity progress={progress} /> : null}

      <Text style={[styles.section, { color: c.text }]}>Bài luyện tập</Text>
      {PRACTICE_MODES.map((m) => (
        <PracticeCard key={m.key} mode={m} onPress={() => router.push(m.route)} />
      ))}
    </ScrollView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  const c = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: c.backgroundElement }]}>
      <Ionicons name={icon} size={22} color={c.primary} />
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function WeekActivity({ progress }: { progress: Progress }) {
  const c = useTheme();
  const max = Math.max(1, ...progress.last7.map((d) => d.count));
  const todayKey = progress.last7[progress.last7.length - 1]?.date;

  return (
    <View style={[styles.progressCard, { backgroundColor: c.backgroundElement }]}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: c.text }]}>Hoạt động 7 ngày</Text>
        <Text style={{ color: c.textSecondary, fontSize: 13 }}>
          Hôm nay {progress.attempts_today} · Tổng {progress.attempts_total}
        </Text>
      </View>
      <View style={styles.bars}>
        {progress.last7.map((d) => {
          const isToday = d.date === todayKey;
          const dow = DOW[new Date(d.date + 'T00:00:00').getDay()];
          const h = 8 + Math.round((d.count / max) * 52);
          return (
            <View key={d.date} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={{
                    width: 18,
                    height: h,
                    borderRadius: 5,
                    backgroundColor: d.count > 0 ? c.primary : c.backgroundSelected,
                  }}
                />
              </View>
              <Text style={{ color: isToday ? c.primary : c.textSecondary, fontSize: 11, fontWeight: isToday ? '700' : '400' }}>
                {dow}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  hello: { fontSize: 26, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  progressCard: { borderRadius: 16, padding: 16, gap: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 15, fontWeight: '700' },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', gap: 6 },
  barTrack: { height: 60, justifyContent: 'flex-end' },
});
