import type { Response } from 'express';
import * as ttsService from '../services/tts.service';
import type { AuthedRequest } from '../types';

export async function speak(req: AuthedRequest, res: Response) {
  try {
    const { text, voice } = req.body || {};
    const wav = await ttsService.synthesize(text, voice);
    // Trả base64 (dễ phát trên cả web lẫn native).
    res.json({ audio: wav.toString('base64'), mime: 'audio/wav' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
