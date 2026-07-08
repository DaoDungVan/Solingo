import { io, type Socket } from 'socket.io-client';

import { API_URL } from './config';
import { getItem, StorageKeys } from './storage';

// Socket kết nối tới gốc backend (bỏ hậu tố /api).
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export async function createSocket(): Promise<Socket> {
  const token = await getItem(StorageKeys.token);
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
}
