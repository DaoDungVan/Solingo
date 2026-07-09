import { io, type Socket } from 'socket.io-client';

import { API_URL } from './config';
import { getItem, StorageKeys } from './storage';

// Socket kết nối tới gốc backend (bỏ hậu tố /api).
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export async function createSocket(): Promise<Socket> {
  const token = await getItem(StorageKeys.token);
  // Không ép transport: Socket.IO tự bắt đầu bằng polling rồi nâng lên websocket
  // → bền hơn khi qua proxy/CDN (Vercel↔Render) hoặc lúc server vừa cold start.
  return io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnectionAttempts: 5,
    timeout: 20000,
  });
}
