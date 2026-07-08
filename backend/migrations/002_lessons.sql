-- Solingo — migration 002: bài học nghe-viết (TN1)

CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,                    -- 'dictation' (sau: 'shadowing' | 'grammar')
  title       TEXT NOT NULL,
  level       TEXT NOT NULL DEFAULT 'A1',        -- A1..C2
  topic       TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL,                     -- 'dictation' | 'fill_blank'
  text        TEXT NOT NULL,                     -- câu đầy đủ (dùng cho TTS đọc)
  display     TEXT,                              -- fill_blank: câu có ___ ; dictation: null
  answers     JSONB NOT NULL DEFAULT '[]',       -- dictation: [câu]; fill_blank: [đáp án từng chỗ trống]
  hint        TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_answer JSONB NOT NULL,                    -- dictation: {"text": "..."}; fill_blank: {"blanks": [...]}
  score       INTEGER NOT NULL DEFAULT 0,        -- 0..100
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  feedback    JSONB,                             -- chi tiết chấm (diff từng từ / từng chỗ trống)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_lesson ON items(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, created_at DESC);
