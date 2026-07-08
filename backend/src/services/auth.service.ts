import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "crypto";

import { pool } from "../config/db";
import { env } from "../config/env";
import * as Q from "../queries/auth.queries";
import type { AuthTokens, UserDto, UserRow } from "../types";

// Chuẩn hoá row user+profile → DTO trả client.
function sanitizeUser(row: any): UserDto {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    display_name: row.display_name ?? null,
    level: row.level ?? "A1",
    streak: row.streak ?? 0,
    xp: row.xp ?? 0,
    onboarded: row.onboarded ?? false,
  };
}

// Cấp access token (JWT ngắn hạn) + refresh token (chuỗi ngẫu nhiên, lưu DB, xoay vòng).
export async function issueAuthTokens(user: UserRow): Promise<AuthTokens> {
  const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.accessTtl,
  } as SignOptions);

  const refreshToken = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + env.refreshTtlDays * 24 * 60 * 60 * 1000);

  await pool.query(Q.INSERT_REFRESH_TOKEN, [user.id, refreshToken, expiresAt]);

  return {
    token,
    refresh_token: refreshToken,
    refresh_token_expires_at: expiresAt.toISOString(),
  };
}

export async function registerUser(input: {
  email?: string;
  password?: string;
  display_name?: string;
}): Promise<{ user: UserDto }> {
  const email = (input.email || "").trim().toLowerCase();
  const password = input.password || "";

  if (!email || !email.includes("@")) throw new Error("Email không hợp lệ");
  if (password.length < 6) throw new Error("Mật khẩu phải từ 6 ký tự trở lên");

  const existing = await pool.query(Q.SELECT_USER_BY_EMAIL, [email]);
  if (existing.rows.length > 0) throw new Error("Email đã được đăng ký");

  const passwordHash = await bcrypt.hash(password, 10);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = await client.query(Q.INSERT_USER, [email, passwordHash]);
    const user = created.rows[0];
    await client.query(Q.INSERT_PROFILE, [user.id, input.display_name || null]);
    await client.query("COMMIT");

    const full = await pool.query(Q.SELECT_USER_WITH_PROFILE, [user.id]);
    return { user: sanitizeUser(full.rows[0]) };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function loginUser(input: {
  email?: string;
  password?: string;
}): Promise<UserRow> {
  const email = (input.email || "").trim().toLowerCase();
  const password = input.password || "";

  const result = await pool.query(Q.SELECT_USER_BY_EMAIL, [email]);
  const user = result.rows[0] as UserRow | undefined;
  if (!user || !user.password_hash) throw new Error("Email hoặc mật khẩu không đúng");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Email hoặc mật khẩu không đúng");

  if (user.status !== "active") throw new Error("Tài khoản đã bị khoá");

  return user;
}

export async function getMe(userId: string): Promise<UserDto> {
  const result = await pool.query(Q.SELECT_USER_WITH_PROFILE, [userId]);
  if (result.rows.length === 0) throw new Error("Không tìm thấy user");
  return sanitizeUser(result.rows[0]);
}

// Đổi refresh token cũ lấy cặp token mới (rotation). Refresh token cũ bị xoá.
export async function refreshUserSession(refreshToken?: string): Promise<
  AuthTokens & { user: UserDto }
> {
  if (!refreshToken) throw new Error("Thiếu refresh_token");

  const result = await pool.query(Q.SELECT_REFRESH_TOKEN, [refreshToken]);
  const row = result.rows[0];
  if (!row) throw new Error("Refresh token không hợp lệ");

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await pool.query(Q.DELETE_REFRESH_TOKEN, [refreshToken]);
    throw new Error("Refresh token đã hết hạn");
  }

  // Rotation: xoá token cũ trước khi cấp mới.
  await pool.query(Q.DELETE_REFRESH_TOKEN, [refreshToken]);

  const userResult = await pool.query(Q.SELECT_USER_FOR_AUTH, [row.user_id]);
  const user = userResult.rows[0] as UserRow | undefined;
  if (!user) throw new Error("User không tồn tại");
  if (user.status !== "active") throw new Error("Tài khoản đã bị khoá");

  const tokens = await issueAuthTokens(user);
  const me = await getMe(user.id);
  return { ...tokens, user: me };
}

export async function logout(userId: string, refreshToken?: string): Promise<void> {
  if (refreshToken) {
    await pool.query(Q.DELETE_REFRESH_TOKEN, [refreshToken]);
  } else {
    await pool.query(Q.DELETE_USER_REFRESH_TOKENS, [userId]);
  }
}
