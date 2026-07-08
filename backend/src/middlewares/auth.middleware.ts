import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { pool } from "../config/db";
import { env } from "../config/env";
import { SELECT_USER_FOR_AUTH } from "../queries/auth.queries";
import type { AuthedRequest, UserRow } from "../types";

async function loadUser(userId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(SELECT_USER_FOR_AUTH, [userId]);
  const user = result.rows[0];
  if (!user || user.status !== "active") return null;
  return user;
}

// Bắt buộc đăng nhập.
export async function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Bạn cần đăng nhập" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
    const user = await loadUser(decoded.id);
    if (!user) return res.status(401).json({ error: "Phiên không hợp lệ" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

// Tuỳ chọn: có token thì gắn user, không có thì coi như guest.
export async function authenticateOptional(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
      req.user = (await loadUser(decoded.id)) ?? undefined;
    }
  } catch {
    req.user = undefined;
  }
  next();
}

// RBAC theo role.
export function authorize(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Bạn cần đăng nhập" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện thao tác này" });
    }
    next();
  };
}
