import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireProjectManager } from '../middleware/projectAuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/projectValidators.js';

const router = Router();

router.use(authenticate);

// Any authenticated user can view their projects and create new projects
router.get('/', projectController.getProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);

router.get('/:id', projectController.getProjectById);

// Only the Project Manager can update or delete the project
router.put('/:id', requireProjectManager, validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', requireProjectManager, projectController.deleteProject);

// Only the Project Manager can add or remove members in their project
router.post('/:id/members', requireProjectManager, projectController.addMember);
router.delete('/:id/members/:userId', requireProjectManager, projectController.removeMember);

export default router;
