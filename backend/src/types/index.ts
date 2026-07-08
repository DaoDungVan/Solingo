import type { Request } from "express";

export type UserRole = "user" | "admin";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// Bản ghi user lấy từ DB (không kèm password_hash khi trả ra ngoài).
export interface UserRow {
  id: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  status: string;
  created_at: string;
}

// DTO user trả về client.
export interface UserDto {
  id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  level: CefrLevel;
  streak: number;
  xp: number;
  onboarded: boolean;
}

// Request đã gắn user sau khi qua authenticate middleware.
export interface AuthedRequest extends Request {
  user?: UserRow;
}

export interface AuthTokens {
  token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}
