import { Router } from 'express';
import * as progressController from '../controllers/progress.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/progress', progressController.getProgress);

export default router;
