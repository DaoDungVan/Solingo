import { Colors } from '@/constants/theme';

// Dùng tông sáng theo màu logo cho toàn app (không theo dark mode hệ thống).
export function useTheme() {
  return Colors.light;
}
