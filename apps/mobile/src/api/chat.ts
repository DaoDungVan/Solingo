import { api } from './client';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  correction: string | null;
}

export const chatApi = {
  send: (history: ChatTurn[], message: string) =>
    api.post<ChatReply>('/chat', { history, message }),
};
