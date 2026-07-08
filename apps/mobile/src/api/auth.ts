import { api } from './client';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  display_name: string | null;
  level: CefrLevel;
  streak: number;
  xp: number;
  onboarded: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user: User;
}

export const authApi = {
  register: (data: { email: string; password: string; display_name?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<{ user: User }>('/auth/me'),
  logout: (refresh_token: string) => api.post('/auth/logout', { refresh_token }),
  setLevel: (level: CefrLevel) =>
    api.patch<{ user: User }>('/profile/level', { level }),
};
