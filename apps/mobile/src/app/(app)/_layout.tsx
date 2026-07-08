import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

// filled khi đang chọn, outline khi không — pattern hiện đại của iOS.
function tabIcon(base: IoniconName) {
  return ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? base : (`${base}-outline` as IoniconName)} size={size} color={color} />
  );
}

export default function AppLayout() {
  const c = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { color: c.text },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Trang chủ', tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="practice"
        options={{ title: 'Luyện tập', tabBarIcon: tabIcon('headset') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Hồ sơ', tabBarIcon: tabIcon('person') }}
      />
    </Tabs>
  );
}
