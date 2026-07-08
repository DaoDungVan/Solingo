import type { Response } from 'express';
import * as ai from '../services/ai.service';
import { pool } from '../config/db';
import type { AuthedRequest } from '../types';

export async function chat(req: AuthedRequest, res: Response) {
  try {
    const { history, message } = req.body || {};
    if (!message || typeof message !== 'string') throw new Error('Thiếu nội dung tin nhắn');

    const lvlRes = await pool.query('SELECT level FROM profiles WHERE user_id = $1', [req.user!.id]);
    const level = lvlRes.rows[0]?.level ?? 'A1';

    // Giữ tối đa 10 lượt gần nhất để tiết kiệm token.
    const trimmed = Array.isArray(history) ? history.slice(-10) : [];
    const result = await ai.chat({ history: trimmed, message, level });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
