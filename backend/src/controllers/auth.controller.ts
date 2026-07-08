import type { Response } from "express";
import * as authService from "../services/auth.service";
import type { AuthedRequest } from "../types";

export async function register(req: AuthedRequest, res: Response) {
  try {
    const { user } = await authService.registerUser(req.body);
    // Đăng ký xong đăng nhập luôn cho tiện.
    const loginUser = await authService.loginUser(req.body);
    const tokens = await authService.issueAuthTokens(loginUser);
    res.status(201).json({ message: "Đăng ký thành công", ...tokens, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: AuthedRequest, res: Response) {
  try {
    const user = await authService.loginUser(req.body);
    const tokens = await authService.issueAuthTokens(user);
    const me = await authService.getMe(user.id);
    res.json({ message: "Đăng nhập thành công", ...tokens, user: me });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function refresh(req: AuthedRequest, res: Response) {
  try {
    const { refresh_token } = req.body || {};
    const result = await authService.refreshUserSession(refresh_token);
    res.json({ message: "Làm mới token thành công", ...result });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function me(req: AuthedRequest, res: Response) {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function logout(req: AuthedRequest, res: Response) {
  try {
    const { refresh_token } = req.body || {};
    await authService.logout(req.user!.id, refresh_token);
    res.json({ message: "Đăng xuất thành công" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
