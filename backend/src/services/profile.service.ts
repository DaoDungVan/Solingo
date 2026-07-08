import { pool } from "../config/db";
import { getMe } from "./auth.service";
import type { CefrLevel, UserDto } from "../types";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const UPDATE_LEVEL = `
  UPDATE profiles
  SET level = $2, onboarded = TRUE, updated_at = now()
  WHERE user_id = $1
`;

// Đặt trình độ (bước onboarding) — đồng thời đánh dấu đã onboard.
export async function setLevel(userId: string, level?: string): Promise<UserDto> {
  if (!level || !LEVELS.includes(level as CefrLevel)) {
    throw new Error("Trình độ không hợp lệ");
  }
  await pool.query(UPDATE_LEVEL, [userId, level]);
  return getMe(userId);
}
