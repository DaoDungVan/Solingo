import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_URL } from '@/lib/config';
import { getItem, setItem, removeItem, StorageKeys } from '@/lib/storage';

export const api = axios.create({ baseURL: API_URL });

// Gắn access token vào mỗi request (đọc bất đồng bộ từ SecureStore/localStorage).
api.interceptors.request.use(async (cfg) => {
  const token = await getItem(StorageKeys.token);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Silent token refresh (port từ Vivudee_Admin/src/api/index.js) ────────────
// 401 → thử refresh bằng refresh_token → retry request gốc. Xếp hàng khi đang refresh.
let isRefreshing = false;
let pendingQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

// AuthContext đăng ký callback này để dọn state + về màn login khi phiên hết hạn.
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(cb: (() => void) | null) {
  onSessionExpired = cb;
}

function flushQueue(newToken: string | null, error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(newToken!)));
  pendingQueue = [];
}

async function clearSession() {
  await removeItem(StorageKeys.token);
  await removeItem(StorageKeys.refreshToken);
  await removeItem(StorageKeys.user);
  onSessionExpired?.();
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (InternalAxiosRequestConfig & { _isRefreshCall?: boolean }) | undefined;

    if (err.response?.status !== 401 || !original || original._isRefreshCall) {
      return Promise.reject(err);
    }

    const refreshToken = await getItem(StorageKeys.refreshToken);
    if (!refreshToken) {
      await clearSession();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      });
    }

    isRefreshing = true;
    try {
      // axios thuần để không kích hoạt interceptor lồng nhau.
      const res = await axios.post(
        `${API_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { _isRefreshCall: true } as any
      );
      const { token: newToken, refresh_token: newRefresh } = res.data;

      await setItem(StorageKeys.token, newToken);
      if (newRefresh) await setItem(StorageKeys.refreshToken, newRefresh);

      flushQueue(newToken, null);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      flushQueue(null, refreshErr);
      await clearSession();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
