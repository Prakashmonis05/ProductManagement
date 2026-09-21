import prisma from '../config/db.js';

export const getTeamMembers = async (search = '') => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      ownedProjects: {
        select: { id: true, name: true, status: true },
      },
      projectMembers: {
        select: {
          projectId: true,
          role: true,
          project: {
            select: { id: true, name: true, status: true },
          },
        },
      },
      assignedTasks: {
        select: {
          id: true,
          status: true,
          priority: true,
        },
      },
    },
  });

  return users.map((u) => {
    const totalAssigned = u.assignedTasks.length;
    const completedTasks = u.assignedTasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgressTasks = u.assignedTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;

    const managedProjectsCount = u.ownedProjects.length;
    const memberProjectsCount = u.projectMembers.filter((pm) => pm.role === 'MEMBER').length;
    const activeProjects = u.projectMembers.filter((pm) => pm.project.status === 'ACTIVE').length;

    const workloadPercentage = Math.min(Math.round((inProgressTasks / 5) * 100), 100);

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role || 'USER',
      joinedDate: u.createdAt,
      managedProjectsCount,
      memberProjectsCount,
      activeProjectsCount: activeProjects,
      assignedTasksCount: totalAssigned,
      completedTasksCount: completedTasks,
      inProgressCount: inProgressTasks,
      workloadPercentage,
    };
  });
};
