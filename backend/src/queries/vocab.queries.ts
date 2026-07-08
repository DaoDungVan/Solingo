// Lấy từ tới hạn ôn (đã học, due_at <= now) + từ mới chưa học, theo level.
// Trả kèm trạng thái học (uv.*) nếu có.
export const SELECT_STUDY_QUEUE = `
  SELECT v.id, v.word, v.meaning, v.ipa, v.example, v.level,
         uv.reps, uv.interval_days, uv.ease, uv.due_at,
         (uv.user_id IS NULL) AS is_new
  FROM vocab v
  LEFT JOIN user_vocab uv ON uv.vocab_id = v.id AND uv.user_id = $1
  WHERE v.level = $2
    AND (uv.user_id IS NULL OR uv.due_at <= now())
  ORDER BY (uv.user_id IS NULL), uv.due_at NULLS FIRST, v.order_index
  LIMIT $3
`;

export const SELECT_USER_VOCAB = `
  SELECT reps, interval_days, ease FROM user_vocab
  WHERE user_id = $1 AND vocab_id = $2
`;

export const UPSERT_USER_VOCAB = `
  INSERT INTO user_vocab (user_id, vocab_id, reps, interval_days, ease, due_at, last_reviewed)
  VALUES ($1, $2, $3, $4, $5, $6, now())
  ON CONFLICT (user_id, vocab_id)
  DO UPDATE SET reps = $3, interval_days = $4, ease = $5, due_at = $6, last_reviewed = now()
`;

// Thống kê: tổng từ theo level, đã học, tới hạn.
export const SELECT_VOCAB_STATS = `
  SELECT
    (SELECT COUNT(*) FROM vocab WHERE level = $2) AS total,
    (SELECT COUNT(*) FROM user_vocab uv JOIN vocab v ON v.id = uv.vocab_id
       WHERE uv.user_id = $1 AND v.level = $2) AS learned,
    (SELECT COUNT(*) FROM user_vocab uv JOIN vocab v ON v.id = uv.vocab_id
       WHERE uv.user_id = $1 AND v.level = $2 AND uv.due_at <= now()) AS due
`;
