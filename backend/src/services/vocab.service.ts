import { pool } from '../config/db';
import * as Q from '../queries/vocab.queries';
import { schedule } from './srs';
import { recordActivity } from './progress.service';

const XP_REVIEW = 2; // thưởng nhỏ mỗi lần ôn từ

// Hàng đợi học: từ mới + từ tới hạn ôn, theo level.
export async function getStudyQueue(userId: string, level: string, limit = 20) {
  const res = await pool.query(Q.SELECT_STUDY_QUEUE, [userId, level, limit]);
  return res.rows.map((r) => ({
    id: r.id,
    word: r.word,
    meaning: r.meaning,
    ipa: r.ipa,
    example: r.example,
    level: r.level,
    is_new: r.is_new,
  }));
}

export async function getStats(userId: string, level: string) {
  const res = await pool.query(Q.SELECT_VOCAB_STATS, [userId, level]);
  const r = res.rows[0];
  return { total: Number(r.total), learned: Number(r.learned), due: Number(r.due) };
}

export async function review(userId: string, vocabId?: string, quality?: number) {
  if (!vocabId) throw new Error('Thiếu vocab_id');
  const q = quality as 0 | 1 | 2 | 3;
  if (![0, 1, 2, 3].includes(q)) throw new Error('quality phải là 0..3');

  const cur = await pool.query(Q.SELECT_USER_VOCAB, [userId, vocabId]);
  const state = cur.rows[0]
    ? { reps: cur.rows[0].reps, interval_days: cur.rows[0].interval_days, ease: cur.rows[0].ease }
    : { reps: 0, interval_days: 0, ease: 2.5 };

  const next = schedule(state, q);
  await pool.query(Q.UPSERT_USER_VOCAB, [
    userId,
    vocabId,
    next.reps,
    next.interval_days,
    next.ease,
    next.due_at,
  ]);

  // Thưởng XP khi nhớ được (quality >= 2) + cập nhật streak (ôn từ cũng tính hoạt động).
  const { xp, streak } = await recordActivity(userId, q >= 2 ? XP_REVIEW : 0);

  return { due_at: next.due_at, interval_days: next.interval_days, xp, streak };
}
