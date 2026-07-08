import { useWindowDimensions } from 'react-native';

// Ngưỡng desktop: >= 900px thì dùng layout web (sidebar, canh giữa).
export function useResponsive() {
  const { width } = useWindowDimensions();
  return { width, isDesktop: width >= 900 };
}
