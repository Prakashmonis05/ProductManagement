import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Workspace member discovery and project assignment directory
router.get('/', teamController.getTeam);

export default router;
