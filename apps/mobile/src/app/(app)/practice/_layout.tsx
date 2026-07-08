import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function PracticeLayout() {
  const c = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { color: c.text },
        headerTintColor: c.primary,
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Luyện tập' }} />
      <Stack.Screen name="dictation" options={{ title: 'Nghe & Viết' }} />
      <Stack.Screen name="shadowing" options={{ title: 'Nghe & Nói' }} />
      <Stack.Screen name="grammar" options={{ title: 'Từ vựng & Ngữ pháp' }} />
      <Stack.Screen name="vocab" options={{ title: 'Học từ vựng' }} />
      <Stack.Screen name="lesson/[id]" options={{ title: 'Bài học' }} />
      <Stack.Screen name="quiz/[id]" options={{ title: 'Ngữ pháp' }} />
      <Stack.Screen name="shadow/[id]" options={{ title: 'Nghe & Nói' }} />
      <Stack.Screen name="chat" options={{ title: 'Trò chuyện với Sol' }} />
      <Stack.Screen name="partner" options={{ title: 'Ghép bạn luyện nói' }} />
    </Stack>
  );
}
