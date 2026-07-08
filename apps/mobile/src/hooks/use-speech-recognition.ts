import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Nhận dạng giọng nói. Hiện dùng Web Speech API (Chrome/Edge, cả mobile web).
// Trên native (Expo Go) chưa hỗ trợ → supported=false, màn hình sẽ báo rõ.
type Recognition = any;

function getSpeechRecognition(): any | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition(lang = 'en-US') {
  const Ctor = getSpeechRecognition();
  const supported = !!Ctor;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {}
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!Ctor) return;
    setError(null);
    setTranscript('');
    const rec: Recognition = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text.trim());
    };
    rec.onerror = (e: any) => {
      setError(e?.error === 'no-speech' ? 'Không nghe thấy giọng nói, thử lại nhé.' : 'Lỗi nhận dạng giọng nói.');
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [Ctor, lang]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, transcript, error, start, stop, reset };
}
