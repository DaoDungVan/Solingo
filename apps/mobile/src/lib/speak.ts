import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

import { api } from '@/api/client';

// Giọng đọc neural qua backend (Gemini TTS), nghe tự nhiên như người thật.
// Có cache phía backend; nếu lỗi mạng/API → tự động fallback giọng thiết bị (expo-speech).

let webAudio: HTMLAudioElement | null = null;
let nativePlayer: { remove?: () => void } | null = null;

async function fetchAudio(text: string): Promise<string> {
  const { data } = await api.post<{ audio: string }>('/tts', { text });
  return data.audio;
}

function deviceFallback(text: string, rate: number) {
  Speech.stop();
  Speech.speak(text, { language: 'en-US', rate, pitch: 1.0 });
}

export async function speak(text: string, opts: { rate?: number } = {}) {
  const rate = opts.rate ?? 1;
  stopSpeaking();
  try {
    const b64 = await fetchAudio(text);

    if (Platform.OS === 'web') {
      const audio = new Audio(`data:audio/wav;base64,${b64}`);
      audio.playbackRate = rate;
      webAudio = audio;
      await audio.play();
      return;
    }

    // Native: ghi file tạm rồi phát bằng expo-audio.
    const FileSystem = require('expo-file-system/legacy');
    const { createAudioPlayer } = require('expo-audio');
    const uri = `${FileSystem.cacheDirectory}tts-${Date.now()}.wav`;
    await FileSystem.writeAsStringAsync(uri, b64, { encoding: 'base64' });
    const player = createAudioPlayer(uri);
    try {
      player.shouldCorrectPitch = true;
      player.setPlaybackRate?.(rate, 'high');
    } catch {}
    nativePlayer = player;
    player.play();
  } catch {
    deviceFallback(text, rate);
  }
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {}
  try {
    if (webAudio) {
      webAudio.pause();
      webAudio = null;
    }
  } catch {}
  try {
    if (nativePlayer) {
      nativePlayer.remove?.();
      nativePlayer = null;
    }
  } catch {}
}
