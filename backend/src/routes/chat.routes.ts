import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/chat', chatController.chat);

export default router;
