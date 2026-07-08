-- Solingo — migration 004: từ vựng (SRS) + hỗ trợ câu trắc nghiệm cho ngữ pháp

-- Ngân hàng từ vựng
CREATE TABLE IF NOT EXISTS vocab (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word        TEXT NOT NULL,
  meaning     TEXT NOT NULL,        -- nghĩa tiếng Việt
  ipa         TEXT,
  example     TEXT,
  level       TEXT NOT NULL DEFAULT 'A1',
  order_index INTEGER NOT NULL DEFAULT 0,
  seed_tag    TEXT
);

-- Trạng thái học từng từ của mỗi user (SRS kiểu SM-2 rút gọn)
CREATE TABLE IF NOT EXISTS user_vocab (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocab_id      UUID NOT NULL REFERENCES vocab(id) ON DELETE CASCADE,
  reps          INTEGER NOT NULL DEFAULT 0,      -- số lần nhớ đúng liên tiếp
  interval_days INTEGER NOT NULL DEFAULT 0,
  ease          REAL NOT NULL DEFAULT 2.5,
  due_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed TIMESTAMPTZ,
  PRIMARY KEY (user_id, vocab_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vocab_due ON user_vocab(user_id, due_at);

-- Câu trắc nghiệm cho ngữ pháp: lựa chọn đáp án
ALTER TABLE items ADD COLUMN IF NOT EXISTS options JSONB;
