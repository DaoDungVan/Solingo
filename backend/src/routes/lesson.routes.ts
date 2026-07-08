import { Router } from 'express';
import * as lessonController from '../controllers/lesson.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/lessons', lessonController.listLessons);
router.get('/lessons/:id/items', lessonController.getLesson);
router.post('/attempts', lessonController.submitAttempt);

export default router;
