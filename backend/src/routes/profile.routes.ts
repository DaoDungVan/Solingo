import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.patch("/profile/level", profileController.setLevel);

export default router;
