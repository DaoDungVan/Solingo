import { Platform } from 'react-native';

// URL backend. Đổi qua biến môi trường EXPO_PUBLIC_API_URL khi cần.
// - Web / iOS simulator: localhost hoạt động.
// - Android emulator: dùng 10.0.2.2 thay cho localhost.
// - Thiết bị thật (Expo Go): thay bằng IP LAN của máy, vd http://192.168.1.10:4000/api
function defaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:4000/api`;
}

export const API_URL = defaultApiUrl();
