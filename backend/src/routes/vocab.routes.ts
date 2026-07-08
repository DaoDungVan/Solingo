import { Router } from 'express';
import * as vocabController from '../controllers/vocab.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/vocab/study', vocabController.studyQueue);
router.post('/vocab/review', vocabController.review);

export default router;
