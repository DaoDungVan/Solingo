-- Solingo — migration 005: streak theo ngày

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_active_date DATE;
