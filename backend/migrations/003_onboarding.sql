-- Solingo — migration 003: cờ onboarding (đã chọn trình độ hay chưa)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT FALSE;
