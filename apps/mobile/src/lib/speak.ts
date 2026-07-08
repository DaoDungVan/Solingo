import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

import { api } from '@/api/client';

// Giọng đọc neural qua backend (Gemini TTS). Nếu lỗi mạng → fallback giọng thiết bị.
// Cơ chế token: chỉ lần gọi speak() MỚI NHẤT được phát; các lần cũ (đang fetch dở) bị huỷ
// → tránh 2 giọng đè lên nhau.

let webAudio: HTMLAudioElement | null = null;
let nativePlayer: { remove?: () => void } | null = null;
let playToken = 0;

async function fetchAudio(text: string): Promise<string> {
  const { data } = await api.post<{ audio: string }>('/tts', { text });
  return data.audio;
}

// Dừng audio đang phát (không đổi token).
function stopPlayback() {
  try {
    Speech.stop();
  } catch {}
  try {
    if (webAudio) {
      webAudio.pause();
      webAudio.src = '';
      webAudio = null;
    }
  } catch {}
  try {
    nativePlayer?.remove?.();
    nativePlayer = null;
  } catch {}
}

// Huỷ mọi phát âm (kể cả câu đang fetch dở).
export function stopSpeaking() {
  playToken++;
  stopPlayback();
}

export async function speak(text: string, opts: { rate?: number } = {}) {
  const rate = opts.rate ?? 1;
  const myToken = ++playToken; // câu này là mới nhất
  stopPlayback(); // ngắt câu đang phát

  try {
    const b64 = await fetchAudio(text);
    if (myToken !== playToken) return; // đã có câu mới hơn → bỏ

    if (Platform.OS === 'web') {
      const audio = new Audio(`data:audio/wav;base64,${b64}`);
      audio.playbackRate = rate;
      webAudio = audio;
      // Không await: nếu bị chặn autoplay thì im lặng bỏ qua, KHÔNG fallback (tránh giọng thiết bị chen vào).
      audio.play().catch(() => {});
      return;
    }

    const FileSystem = require('expo-file-system/legacy');
    const { createAudioPlayer } = require('expo-audio');
    const uri = `${FileSystem.cacheDirectory}tts-${myToken}.wav`;
    await FileSystem.writeAsStringAsync(uri, b64, { encoding: 'base64' });
    if (myToken !== playToken) return;
    const player = createAudioPlayer(uri);
    try {
      player.shouldCorrectPitch = true;
      player.setPlaybackRate?.(rate, 'high');
    } catch {}
    nativePlayer = player;
    player.play();
  } catch {
    // Chỉ fallback khi LỖI MẠNG/API (không phải autoplay), và vẫn là câu mới nhất.
    if (myToken !== playToken) return;
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate, pitch: 1.0 });
  }
}
