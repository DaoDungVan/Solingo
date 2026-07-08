import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function TextField({ label, error, style, ...rest }: Props) {
  const c = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={c.textSecondary}
        style={[
          styles.input,
          {
            color: c.text,
            backgroundColor: c.backgroundElement,
            borderColor: error ? c.danger : c.border,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: { fontSize: 12 },
});
