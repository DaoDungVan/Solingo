export const SELECT_LESSONS = `
  SELECT id, type, title, level, topic, order_index
  FROM lessons
  WHERE type = $1 AND ($2::text IS NULL OR level = $2)
  ORDER BY order_index, created_at
`;

export const SELECT_LESSON = `
  SELECT id, type, title, level, topic
  FROM lessons
  WHERE id = $1
`;

// Không trả cột answers ra ngoài (tránh lộ đáp án fill_blank).
export const SELECT_ITEMS_PUBLIC = `
  SELECT id, kind, text, display, hint, options, order_index
  FROM items
  WHERE lesson_id = $1
  ORDER BY order_index
`;

// Dùng khi chấm — có answers.
export const SELECT_ITEM_FOR_GRADE = `
  SELECT id, lesson_id, kind, text, answers
  FROM items
  WHERE id = $1
`;

export const INSERT_ATTEMPT = `
  INSERT INTO attempts (user_id, item_id, user_answer, score, is_correct, feedback)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id, created_at
`;
