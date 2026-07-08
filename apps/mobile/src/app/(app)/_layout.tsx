import { Ionicons } from '@expo/vector-icons';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface NavItem {
  label: string;
  icon: IconName;
  route: '/(app)' | '/(app)/practice' | '/(app)/profile';
  match: (p: string) => boolean;
}

const NAV: NavItem[] = [
  { label: 'Trang chủ', icon: 'home', route: '/(app)', match: (p) => p === '/' },
  { label: 'Luyện tập', icon: 'headset', route: '/(app)/practice', match: (p) => p.startsWith('/practice') },
  { label: 'Hồ sơ', icon: 'person', route: '/(app)/profile', match: (p) => p.startsWith('/profile') },
];

export default function AppLayout() {
  const c = useTheme();
  const { isDesktop } = useResponsive();
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── Desktop: sidebar trái + nội dung canh giữa ──
  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.background }}>
        <View style={[styles.sidebar, { backgroundColor: c.backgroundElement, borderRightColor: c.border }]}>
          <Image
            source={require('@/assets/images/logo-wordmark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.navList}>
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Pressable
                  key={item.route}
                  onPress={() => router.navigate(item.route)}
                  style={({ pressed }) => [
                    styles.navItem,
                    { backgroundColor: active ? c.primary + '22' : pressed ? c.backgroundSelected : 'transparent' },
                  ]}>
                  <Ionicons
                    name={active ? item.icon : (`${item.icon}-outline` as IconName)}
                    size={22}
                    color={active ? c.primary : c.textSecondary}
                  />
                  <Text style={{ color: active ? c.primary : c.text, fontWeight: active ? '700' : '500', fontSize: 15 }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.mainWrap}>
          <View style={styles.mainCol}>
            <Slot />
          </View>
        </View>
      </View>
    );
  }

  // ── Mobile: nội dung + thanh tab dưới ──
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Slot />
      </View>
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: c.background, borderTopColor: c.border, paddingBottom: insets.bottom || 8 },
        ]}>
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Pressable key={item.route} onPress={() => router.navigate(item.route)} style={styles.bottomItem}>
              <Ionicons
                name={active ? item.icon : (`${item.icon}-outline` as IconName)}
                size={24}
                color={active ? c.primary : c.textSecondary}
              />
              <Text style={{ color: active ? c.primary : c.textSecondary, fontSize: 11 }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: 240, borderRightWidth: 1, paddingHorizontal: 16, paddingTop: 28 },
  logo: { width: 150, height: 44, marginLeft: 8 },
  navList: { gap: 4, marginTop: 28 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  mainWrap: { flex: 1, alignItems: 'center' },
  mainCol: { flex: 1, width: '100%', maxWidth: 820 },
  bottomBar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
  bottomItem: { flex: 1, alignItems: 'center', gap: 2 },
});
