import { api } from './client';

export interface Lesson {
  id: string;
  type: string;
  title: string;
  level: string;
  topic: string | null;
  order_index: number;
}

export interface Item {
  id: string;
  kind: 'dictation' | 'fill_blank' | 'mcq' | 'reorder' | 'write';
  text: string; // câu đầy đủ / câu hỏi / yêu cầu viết (write); reorder: rỗng
  display: string | null; // fill_blank: câu có ___ ; reorder: lời nhắc
  hint: string | null;
  options: string[] | null; // mcq: lựa chọn; reorder: các từ đã xáo trộn
  order_index: number;
}

export interface DictationFeedback {
  words: { word: string; correct: boolean }[];
  expected: string;
}
export interface FillBlankFeedback {
  blanks: { expected: string; given: string; correct: boolean }[];
}
export interface ChoiceFeedback {
  given: string;
  expected: string;
}
export interface WriteFeedback {
  corrected: string;
  explanation: string;
}

export interface GradeResult {
  score: number;
  isCorrect: boolean;
  feedback: DictationFeedback | FillBlankFeedback | ChoiceFeedback | WriteFeedback;
  xpGain: number;
  xp: number | null;
}

export const lessonsApi = {
  list: (type = 'dictation', level?: string) =>
    api.get<{ lessons: Lesson[] }>('/lessons', { params: { type, level } }),
  items: (id: string) => api.get<{ lesson: Lesson; items: Item[] }>(`/lessons/${id}/items`),
  submit: (item_id: string, answer: { text?: string; blanks?: string[]; choice?: string }) =>
    api.post<GradeResult>('/attempts', { item_id, answer }),
};
