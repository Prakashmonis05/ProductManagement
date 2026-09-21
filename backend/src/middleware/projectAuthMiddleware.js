import prisma from '../config/db.js';
import { errorResponse } from '../utils/apiResponse.js';

export const requireProjectManager = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.projectId;

    if (!projectId) {
      return errorResponse(res, 'Project ID is required', 400);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: req.user.id },
        },
      },
    });

    if (!project) {
      return errorResponse(res, 'Project not found', 404);
    }

    const isOwner = project.ownerId === req.user.id;
    const isManagerMember = project.members.some((m) => m.role === 'MANAGER');

    if (!isOwner && !isManagerMember) {
      return errorResponse(
        res,
        'Permission denied. Only the manager of this project can perform this action.',
        403
      );
    }

    req.project = project;
    req.isProjectManager = true;
    next();
  } catch (error) {
    next(error);
  }
};
