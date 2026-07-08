import type { Response } from 'express';
import * as progressService from '../services/progress.service';
import type { AuthedRequest } from '../types';

export async function getProgress(req: AuthedRequest, res: Response) {
  try {
    const data = await progressService.getProgress(req.user!.id);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
