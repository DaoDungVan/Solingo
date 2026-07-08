import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { env } from '../config/env';

const CACHE_DIR = path.join(process.cwd(), 'storage', 'tts');
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const DEFAULT_VOICE = 'Kore'; // giọng nữ ấm; các giọng khác: Puck, Charon, Aoede...

// Bọc PCM 16-bit mono thành file WAV để phát được.
function pcmToWav(pcm: Buffer, sampleRate = 24000): Buffer {
  const channels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// Tạo giọng đọc (WAV). Cache theo hash(text|voice) để câu lặp không gọi API lại.
export async function synthesize(text: string, voice = DEFAULT_VOICE): Promise<Buffer> {
  if (!env.geminiApiKey) throw new Error('Chưa cấu hình GEMINI_API_KEY');
  const clean = text.trim().slice(0, 600);
  if (!clean) throw new Error('Thiếu nội dung cần đọc');

  const hash = crypto.createHash('sha1').update(`${voice}|${clean}`).digest('hex');
  const file = path.join(CACHE_DIR, `${hash}.wav`);
  if (fs.existsSync(file)) return fs.readFileSync(file);

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const res = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: clean,
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  });

  const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error('TTS không trả audio');

  const wav = pcmToWav(Buffer.from(b64, 'base64'));
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(file, wav);
  return wav;
}
