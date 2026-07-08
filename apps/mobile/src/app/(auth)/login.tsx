import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { AuthShell } from '@/features/auth/auth-shell';
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
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Đăng nhập thất bại. Kiểm tra kết nối tới backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Text style={[styles.title, { color: c.text }]}>Đăng nhập</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>Chào mừng bạn quay lại 👋</Text>

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
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginBottom: 20 },
  form: { gap: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
});
