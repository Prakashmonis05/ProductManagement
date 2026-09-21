import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validators/taskValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.patch('/:id/status', validate(updateTaskStatusSchema), taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

// Task comments nested endpoints
router.get('/:id/comments', taskController.getComments);
router.post('/:id/comments', taskController.addComment);

export default router;
