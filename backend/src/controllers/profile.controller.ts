import type { Response } from "express";
import * as profileService from "../services/profile.service";
import type { AuthedRequest } from "../types";

export async function setLevel(req: AuthedRequest, res: Response) {
  try {
    const user = await profileService.setLevel(req.user!.id, req.body?.level);
    res.json({ message: "Đã cập nhật trình độ", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
