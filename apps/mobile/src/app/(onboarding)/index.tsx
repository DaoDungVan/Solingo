import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CefrLevel } from '@/api/auth';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

interface LevelOption {
  level: CefrLevel;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: LevelOption[] = [
  { level: 'A1', title: 'Mất gốc', subtitle: 'Mới bắt đầu, biết rất ít từ', icon: 'leaf-outline' },
  { level: 'A2', title: 'Sơ cấp', subtitle: 'Giao tiếp câu đơn giản hằng ngày', icon: 'walk-outline' },
  { level: 'B1', title: 'Trung cấp', subtitle: 'Nói về công việc, kế hoạch, ý kiến', icon: 'bicycle-outline' },
  { level: 'B2', title: 'Nâng cao', subtitle: 'Diễn đạt trôi chảy chủ đề phức tạp', icon: 'rocket-outline' },
];

export default function OnboardingScreen() {
  const c = useTheme();
  const { completeOnboarding, user } = useAuth();
  const [saving, setSaving] = useState<CefrLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(level: CefrLevel) {
    setError(null);
    setSaving(level);
    try {
      await completeOnboarding(level);
      // Điều hướng vào app do useProtectedRoute ở root xử lý.
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Không lưu được. Kiểm tra kết nối backend.');
      setSaving(null);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.hi, { color: c.textSecondary }]}>
        Xin chào {user?.display_name || ''} 👋
      </Text>
      <Text style={[styles.title, { color: c.text }]}>Bạn học tiếng Anh ở mức nào?</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        Chọn để chúng mình đưa nội dung phù hợp. Bạn có thể đổi lại sau trong Hồ sơ.
      </Text>

      <View style={styles.list}>
        {OPTIONS.map((o) => {
          const isSaving = saving === o.level;
          return (
            <Pressable
              key={o.level}
              disabled={!!saving}
              onPress={() => pick(o.level)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: c.backgroundElement,
                  borderColor: c.border,
                  opacity: saving && !isSaving ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}>
              <View style={[styles.iconWrap, { backgroundColor: c.primary + '22' }]}>
                <Ionicons name={o.icon} size={24} color={c.primary} />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{o.title}</Text>
                  <Text style={[styles.levelTag, { color: c.primary, borderColor: c.primary }]}>
                    {o.level}
                  </Text>
                </View>
                <Text style={[styles.cardSub, { color: c.textSecondary }]}>{o.subtitle}</Text>
              </View>
              {isSaving ? (
                <ActivityIndicator color={c.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
              )}
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={{ color: c.danger, textAlign: 'center' }}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8, paddingTop: 72 },
  hi: { fontSize: 15 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: 16 },
  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  levelTag: { fontSize: 11, fontWeight: '700', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  cardSub: { fontSize: 13 },
});
