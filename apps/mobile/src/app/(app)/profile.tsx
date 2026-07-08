import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CefrLevel } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];

export default function ProfileScreen() {
  const c = useTheme();
  const { user, signOut, completeOnboarding } = useAuth();
  const [changing, setChanging] = useState<CefrLevel | null>(null);

  async function changeLevel(level: CefrLevel) {
    if (level === user?.level) return;
    setChanging(level);
    try {
      await completeOnboarding(level);
    } finally {
      setChanging(null);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <View style={[styles.avatar, { backgroundColor: c.primary + '22' }]}>
        <Ionicons name="person" size={44} color={c.primary} />
      </View>
      <Text style={[styles.name, { color: c.text }]}>{user?.display_name || 'Người học'}</Text>
      <Text style={{ color: c.textSecondary }}>{user?.email}</Text>

      <View style={[styles.info, { backgroundColor: c.backgroundElement }]}>
        <Row label="Chuỗi ngày" value={`🔥 ${user?.streak ?? 0}`} />
        <Row label="Điểm XP" value={`⭐ ${user?.xp ?? 0}`} />
      </View>

      {/* Đổi trình độ */}
      <View style={styles.levelSection}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Trình độ</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((lv) => {
            const active = user?.level === lv;
            return (
              <Pressable
                key={lv}
                disabled={!!changing}
                onPress={() => changeLevel(lv)}
                style={[
                  styles.levelChip,
                  {
                    backgroundColor: active ? c.primary : c.backgroundElement,
                    borderColor: active ? c.primary : c.border,
                    opacity: changing && changing !== lv ? 0.5 : 1,
                  },
                ]}>
                <Text style={{ color: active ? c.onPrimary : c.text, fontWeight: '700' }}>{lv}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button title="Đăng xuất" variant="ghost" onPress={signOut} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <Text style={{ color: c.textSecondary }}>{label}</Text>
      <Text style={{ color: c.text, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12, alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  name: { fontSize: 22, fontWeight: '800' },
  info: { alignSelf: 'stretch', borderRadius: 16, padding: 16, gap: 14, marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  levelSection: { alignSelf: 'stretch', gap: 8, marginVertical: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '500' },
  levelRow: { flexDirection: 'row', gap: 10 },
  levelChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
