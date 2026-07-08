// Chạy tuần tự tất cả file .sql trong backend/migrations theo thứ tự tên.
// Ghi lại file đã chạy vào bảng _migrations để không chạy lại.
import fs from "fs";
import path from "path";
import { pool } from "../src/config/db";

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const done = new Set(
    (await pool.query<{ name: string }>("SELECT name FROM _migrations")).rows.map((r) => r.name)
  );

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (done.has(file)) {
      console.log(`[migrate] bỏ qua (đã chạy): ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`[migrate] chạy: ${file}`);
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO _migrations(name) VALUES ($1)", [file]);
      await pool.query("COMMIT");
      console.log(`[migrate] xong: ${file}`);
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }

  console.log("[migrate] hoàn tất tất cả migration.");
  await pool.end();
}

run().catch((err) => {
  console.error("[migrate] LỖI:", err);
  process.exit(1);
});
