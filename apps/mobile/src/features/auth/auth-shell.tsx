import type { ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';

// Khung cho màn đăng nhập/đăng ký:
// - Desktop: 2 cột (panel thương hiệu bên trái + form bên phải)
// - Mobile: logo trên cùng + form canh giữa
export function AuthShell({ children }: { children: ReactNode }) {
  const c = useTheme();
  const { isDesktop } = useResponsive();

  const form = <View style={styles.formCol}>{children}</View>;

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.background }}>
        <View style={[styles.brand, { backgroundColor: c.primary }]}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.brandMark}
            resizeMode="cover"
          />
          <Text style={styles.brandTitle}>Solingo</Text>
          <Text style={styles.brandTag}>
            Học tiếng Anh 4 kỹ năng — nghe, nói, đọc, viết & trò chuyện với AI.
          </Text>
        </View>
        <View style={styles.formSide}>{form}</View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.mobileScroll} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo-wordmark.png')}
          style={styles.mobileLogo}
          resizeMode="contain"
        />
        {form}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formCol: { width: '100%', maxWidth: 380, gap: 8, alignSelf: 'center' },
  brand: { width: '42%', maxWidth: 460, alignItems: 'center', justifyContent: 'center', padding: 48, gap: 16 },
  brandMark: { width: 108, height: 108, borderRadius: 24 },
  brandTitle: { color: '#ffffff', fontSize: 40, fontWeight: '800' },
  brandTag: { color: '#ffffffdd', fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 340 },
  formSide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  mobileScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  mobileLogo: { width: 220, height: 66, marginBottom: 12 },
});
