import { DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

// Điều hướng bảo vệ: chưa đăng nhập → về (auth); đã đăng nhập mà đang ở (auth) → vào (app).
function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!user) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (!user.onboarded) {
      // Đã đăng nhập nhưng chưa chọn trình độ → bắt buộc onboarding.
      if (!inOnboarding) router.replace('/(onboarding)');
    } else if (inAuthGroup || inOnboarding) {
      router.replace('/(app)');
    }
  }, [user, loading, segments]);
}

function RootNavigator() {
  const { loading } = useAuth();
  const c = useTheme();
  useProtectedRoute();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
