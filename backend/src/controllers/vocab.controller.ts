import type { Response } from 'express';
import * as vocabService from '../services/vocab.service';
import type { AuthedRequest } from '../types';

export async function studyQueue(req: AuthedRequest, res: Response) {
  try {
    const lvl = (req.query.level as string) || 'A1';
    const queue = await vocabService.getStudyQueue(req.user!.id, lvl);
    const stats = await vocabService.getStats(req.user!.id, lvl);
    res.json({ queue, stats });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function review(req: AuthedRequest, res: Response) {
  try {
    const { vocab_id, quality } = req.body || {};
    const result = await vocabService.review(req.user!.id, vocab_id, quality);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
