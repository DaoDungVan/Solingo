import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { AuthShell } from '@/features/auth/auth-shell';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const c = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Đăng ký thất bại. Kiểm tra kết nối tới backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Text style={[styles.title, { color: c.text }]}>Tạo tài khoản</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>Bắt đầu hành trình học tiếng Anh</Text>

      <View style={styles.form}>
        <TextField label="Tên hiển thị" value={name} onChangeText={setName} placeholder="Tên của bạn" />
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
          placeholder="Tối thiểu 6 ký tự"
          secureTextEntry
        />
        {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
        <Button title="Đăng ký" onPress={onSubmit} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={{ color: c.textSecondary }}>Đã có tài khoản? </Text>
        <Link href="/(auth)/login" style={{ color: c.primary, fontWeight: '600' }}>
          Đăng nhập
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
