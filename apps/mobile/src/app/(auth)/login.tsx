import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const c = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Điều hướng do useProtectedRoute ở root xử lý.
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Đăng nhập thất bại. Kiểm tra kết nối tới backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image
          source={require('@/assets/images/logo-wordmark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Đăng nhập để luyện tiếng Anh
        </Text>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="ban@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextField
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
          />
          {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
          <Button title="Đăng nhập" onPress={onSubmit} loading={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={{ color: c.textSecondary }}>Chưa có tài khoản? </Text>
          <Link href="/(auth)/register" style={{ color: c.primary, fontWeight: '600' }}>
            Đăng ký
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 8 },
  logo: { width: 240, height: 72, alignSelf: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 24 },
  form: { gap: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
