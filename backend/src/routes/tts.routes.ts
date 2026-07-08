import { Router } from 'express';
import * as ttsController from '../controllers/tts.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/tts', ttsController.speak);

export default router;
