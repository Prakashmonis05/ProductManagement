import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/projects/:id', analyticsController.getProjectAnalytics);

export default router;
