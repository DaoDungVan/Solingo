// SQL constants cho auth. Tách khỏi service theo pattern routes→controllers→services→queries.

export const INSERT_USER = `
  INSERT INTO users (email, password_hash)
  VALUES ($1, $2)
  RETURNING id, email, role, status, created_at
`;

export const INSERT_PROFILE = `
  INSERT INTO profiles (user_id, display_name)
  VALUES ($1, $2)
`;

export const SELECT_USER_BY_EMAIL = `
  SELECT id, email, password_hash, role, status, created_at
  FROM users
  WHERE email = $1
`;

// Dùng trong middleware để nạp trạng thái auth từ token.
export const SELECT_USER_FOR_AUTH = `
  SELECT id, email, role, status, created_at
  FROM users
  WHERE id = $1
`;

// User + profile (cho /me và DTO).
export const SELECT_USER_WITH_PROFILE = `
  SELECT u.id, u.email, u.role,
         p.display_name, p.level, p.streak, p.xp, p.onboarded
  FROM users u
  LEFT JOIN profiles p ON p.user_id = u.id
  WHERE u.id = $1
`;

export const INSERT_REFRESH_TOKEN = `
  INSERT INTO refresh_tokens (user_id, token, expires_at)
  VALUES ($1, $2, $3)
`;

export const SELECT_REFRESH_TOKEN = `
  SELECT id, user_id, token, expires_at
  FROM refresh_tokens
  WHERE token = $1
`;

export const DELETE_REFRESH_TOKEN = `
  DELETE FROM refresh_tokens WHERE token = $1
`;

export const DELETE_USER_REFRESH_TOKENS = `
  DELETE FROM refresh_tokens WHERE user_id = $1
`;
