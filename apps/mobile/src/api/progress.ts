import { api } from './client';

export interface Progress {
  attempts_total: number;
  attempts_today: number;
  vocab_learned: number;
  last7: { date: string; count: number }[];
}

export const progressApi = {
  get: () => api.get<Progress>('/progress'),
};
