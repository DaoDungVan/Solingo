import { pool } from '../config/db';

// Cập nhật streak dựa trên ngày hoạt động gần nhất (atomic trong 1 câu SQL):
// - hôm nay rồi → giữ nguyên; hôm qua → +1; lâu hơn/chưa có → reset về 1.
const TOUCH_STREAK = `
  UPDATE profiles SET
    streak = CASE
      WHEN last_active_date = CURRENT_DATE THEN streak
      WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1
      ELSE 1
    END,
    last_active_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = $1
  RETURNING streak
`;

const ADD_XP = `
  UPDATE profiles SET xp = xp + $2, updated_at = now()
  WHERE user_id = $1 RETURNING xp
`;

// Ghi nhận một hoạt động học: cộng XP (nếu có) + cập nhật streak. Trả {xp, streak}.
export async function recordActivity(userId: string, xpGain: number) {
  let xp: number | null = null;
  if (xpGain > 0) {
    const xpRes = await pool.query(ADD_XP, [userId, xpGain]);
    xp = xpRes.rows[0]?.xp ?? null;
  }
  const stRes = await pool.query(TOUCH_STREAK, [userId]);
  const streak = stRes.rows[0]?.streak ?? null;
  return { xp, streak };
}

// Thống kê tiến độ cho màn hình chính.
export async function getProgress(userId: string) {
  const totals = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM attempts WHERE user_id = $1) AS attempts_total,
       (SELECT COUNT(*) FROM attempts WHERE user_id = $1 AND created_at::date = CURRENT_DATE) AS attempts_today,
       (SELECT COUNT(*) FROM user_vocab WHERE user_id = $1) AS vocab_learned`,
    [userId]
  );

  // Số bài tập mỗi ngày trong 7 ngày gần nhất — sinh dải ngày & đếm hoàn toàn trong SQL
  // để mọi mốc ngày dùng chung CURRENT_DATE (tránh lệch múi giờ giữa JS và DB).
  const week = await pool.query<{ date: string; count: number }>(
    `SELECT to_char(d::date, 'YYYY-MM-DD') AS date, COALESCE(t.cnt, 0)::int AS count
     FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, INTERVAL '1 day') AS d
     LEFT JOIN (
       SELECT created_at::date AS day, COUNT(*) AS cnt
       FROM attempts
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - 6
       GROUP BY day
     ) t ON t.day = d::date
     ORDER BY d`,
    [userId]
  );
  const last7 = week.rows.map((r) => ({ date: r.date, count: Number(r.count) }));

  const t = totals.rows[0];
  return {
    attempts_total: Number(t.attempts_total),
    attempts_today: Number(t.attempts_today),
    vocab_learned: Number(t.vocab_learned),
    last7,
  };
}
