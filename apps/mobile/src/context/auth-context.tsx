import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi, type CefrLevel, type User } from '@/api/auth';
import { setOnSessionExpired } from '@/api/client';
import { getItem, setItem, removeItem, StorageKeys } from '@/lib/storage';

interface AuthState {
  user: User | null;
  loading: boolean; // đang khôi phục phiên lúc mở app
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeOnboarding: (level: CefrLevel) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function persistSession(res: {
    token: string;
    refresh_token: string;
    user: User;
  }) {
    await setItem(StorageKeys.token, res.token);
    await setItem(StorageKeys.refreshToken, res.refresh_token);
    await setItem(StorageKeys.user, JSON.stringify(res.user));
    setUser(res.user);
  }

  async function signIn(email: string, password: string) {
    const { data } = await authApi.login({ email, password });
    await persistSession(data);
  }

  async function signUp(email: string, password: string, displayName?: string) {
    const { data } = await authApi.register({ email, password, display_name: displayName });
    await persistSession(data);
  }

  async function signOut() {
    const refresh = await getItem(StorageKeys.refreshToken);
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // kệ lỗi mạng — vẫn xoá local.
    }
    await removeItem(StorageKeys.token);
    await removeItem(StorageKeys.refreshToken);
    await removeItem(StorageKeys.user);
    setUser(null);
  }

  async function refreshUser() {
    const { data } = await authApi.me();
    setUser(data.user);
    await setItem(StorageKeys.user, JSON.stringify(data.user));
  }

  async function completeOnboarding(level: CefrLevel) {
    const { data } = await authApi.setLevel(level);
    setUser(data.user);
    await setItem(StorageKeys.user, JSON.stringify(data.user));
  }

  // Khi phiên hết hạn (refresh cũng fail) → client gọi callback này.
  useEffect(() => {
    setOnSessionExpired(() => setUser(null));
    return () => setOnSessionExpired(null);
  }, []);

  // Khôi phục phiên lúc mở app: đọc user cache, rồi xác thực lại bằng /me.
  useEffect(() => {
    (async () => {
      try {
        const cached = await getItem(StorageKeys.user);
        const token = await getItem(StorageKeys.token);
        if (cached) setUser(JSON.parse(cached));
        if (token) {
          try {
            await refreshUser();
          } catch {
            // /me lỗi (và refresh cũng fail) → coi như chưa đăng nhập.
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, signIn, signUp, signOut, refreshUser, completeOnboarding }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải nằm trong <AuthProvider>');
  return ctx;
}
