import type { Response } from 'express';
import * as lessonService from '../services/lesson.service';
import type { AuthedRequest } from '../types';

export async function listLessons(req: AuthedRequest, res: Response) {
  try {
    const type = (req.query.type as string) || 'dictation';
    const level = (req.query.level as string) || undefined;
    const lessons = await lessonService.listLessons(type, level);
    res.json({ lessons });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getLesson(req: AuthedRequest, res: Response) {
  try {
    const data = await lessonService.getLessonWithItems(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function submitAttempt(req: AuthedRequest, res: Response) {
  try {
    const result = await lessonService.submitAttempt(req.user!.id, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
