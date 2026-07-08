import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { PRACTICE_MODES } from '@/features/practice/modes';
import { PracticeCard } from '@/features/practice/practice-card';

export default function PracticeHub() {
  const c = useTheme();
  const router = useRouter();
  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      {PRACTICE_MODES.map((m) => (
        <PracticeCard key={m.key} mode={m} onPress={() => router.push(m.route)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14 },
});
