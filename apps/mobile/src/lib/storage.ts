import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Lưu token an toàn: SecureStore trên native, localStorage trên web.
// (expo-secure-store không chạy trên web.)
const isWeb = Platform.OS === 'web';

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const StorageKeys = {
  token: 'token',
  refreshToken: 'refresh_token',
  user: 'user',
} as const;
