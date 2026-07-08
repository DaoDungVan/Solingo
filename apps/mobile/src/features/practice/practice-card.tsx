import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { PracticeMode } from './modes';

export function PracticeCard({ mode, onPress }: { mode: PracticeMode; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={mode.available ? onPress : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.backgroundElement, opacity: mode.available ? (pressed ? 0.85 : 1) : 0.55 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: c.primary + '22' }]}>
        <Ionicons name={mode.icon} size={24} color={c.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: c.text }]}>{mode.title}</Text>
        <Text style={[styles.desc, { color: c.textSecondary }]}>{mode.description}</Text>
      </View>
      {!mode.available ? (
        <Text style={[styles.badge, { color: c.textSecondary, borderColor: c.border }]}>Sắp có</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 13 },
  badge: { fontSize: 11, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
});
