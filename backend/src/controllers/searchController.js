import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const query = q.trim();

    if (!query) {
      return successResponse(res, 'Search results', { projects: [], tasks: [], people: [] });
    }

    const [projects, tasks, people] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: {
          id: true,
          name: true,
          status: true,
          color: true,
          priority: true,
        },
      }),
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 8,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          projectId: true,
          project: { select: { id: true, name: true, color: true } },
          assignedTo: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
      }),
    ]);

    return successResponse(res, 'Search results', {
      projects,
      tasks,
      people,
    });
  } catch (error) {
    next(error);
  }
};
