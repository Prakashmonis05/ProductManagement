import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', searchController.globalSearch);

export default router;
