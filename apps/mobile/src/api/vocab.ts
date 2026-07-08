import { api } from './client';

export interface VocabCard {
  id: string;
  word: string;
  meaning: string;
  ipa: string | null;
  example: string | null;
  level: string;
  is_new: boolean;
}

export interface VocabStats {
  total: number;
  learned: number;
  due: number;
}

export interface ReviewResult {
  due_at: string;
  interval_days: number;
  xp: number | null;
}

// quality: 0=Again, 1=Khó, 2=Tốt, 3=Dễ
export const vocabApi = {
  study: (level: string) =>
    api.get<{ queue: VocabCard[]; stats: VocabStats }>('/vocab/study', { params: { level } }),
  review: (vocab_id: string, quality: 0 | 1 | 2 | 3) =>
    api.post<ReviewResult>('/vocab/review', { vocab_id, quality }),
};
