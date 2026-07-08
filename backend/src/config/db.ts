import { Pool } from "pg";
import { env } from "./env";

// Đổi cổng 5432 → 6543 (pgBouncer pooler của Supabase) + thêm ?pgbouncer=true.
// Giữ nguyên pattern từ backend-log-function/src/config/db.js.
const base = env.databaseUrl;
const withPooler = base.includes(":5432") ? base.replace(":5432", ":6543") : base;
const connectionString = withPooler.includes("?")
  ? `${withPooler}&pgbouncer=true`
  : `${withPooler}?pgbouncer=true`;

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase self-signed
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool
  .query("SELECT 1")
  .then(() => console.log("[db] Kết nối Postgres (Supabase pooler) thành công"))
  .catch((err) => console.error("[db] Lỗi kết nối Postgres:", err.message));

// Helper query gọn cho service.
export const query = <T extends Record<string, any> = any>(
  text: string,
  params?: unknown[]
) => pool.query<T>(text, params as any[]);
