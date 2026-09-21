import prisma from '../config/db.js';

export const getProjects = async (user, filters = {}) => {
  const { search, status, priority, page = 1, limit = 50 } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};

  // Show projects user owns (as manager) or is a member of
  where.OR = [
    { ownerId: user.id },
    { members: { some: { userId: user.id } } },
  ];

  if (search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (priority && priority !== 'ALL') {
    where.priority = priority;
  }

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        },
        tasks: {
          select: { id: true, status: true, priority: true, dueDate: true },
        },
      },
    }),
  ]);

  // Compute computed fields for frontend (progress %, total tasks, completed tasks, userRole)
  const formattedProjects = projects.map((p) => {
    const totalTasks = p.tasks.length;
    const completedTasks = p.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isManager = p.ownerId === user.id || p.members.some((m) => m.userId === user.id && m.role === 'MANAGER');
    return {
      ...p,
      totalTasks,
      completedTasks,
      progress,
      isManager,
      userRole: isManager ? 'MANAGER' : 'MEMBER',
    };
  });

  return {
    projects: formattedProjects,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getProjectById = async (projectId, user) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatar: true, role: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, role: true },
          },
        },
      },
      tasks: {
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
      },
      activities: {
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isManager = project.ownerId === user.id || project.members.some((m) => m.userId === user.id && m.role === 'MANAGER');

  return {
    ...project,
    totalTasks,
    completedTasks,
    progress,
    userRole: isManager ? 'MANAGER' : 'MEMBER',
    isManager,
  };
};

export const createProject = async (user, data) => {
  const { name, description, status = 'ACTIVE', priority = 'MEDIUM', color = '#6366f1', startDate, dueDate, memberIds = [] } = data;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      status,
      priority,
      color,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      ownerId: user.id,
      members: {
        create: [
          { userId: user.id, role: 'MANAGER' },
          ...memberIds
            .filter((id) => id !== user.id)
            .map((userId) => ({ userId, role: 'MEMBER' })),
        ],
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId: user.id,
      projectId: project.id,
      action: 'CREATED_PROJECT',
      metadata: { projectName: project.name },
    },
  });

  return {
    ...project,
    isManager: true,
    userRole: 'MANAGER',
    totalTasks: 0,
    completedTasks: 0,
    progress: 0,
  };
};

export const updateProject = async (projectId, user, data) => {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const isManager = existing.ownerId === user.id || existing.members.some((m) => m.userId === user.id && m.role === 'MANAGER');
  if (!isManager) {
    const error = new Error('Permission denied. Only the project manager can update this project.');
    error.statusCode = 403;
    throw error;
  }

  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.color !== undefined) updatePayload.color = data.color;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: updatePayload,
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });

  await prisma.activity.create({
    data: {
      userId: user.id,
      projectId,
      action: 'UPDATED_PROJECT',
      metadata: { changes: Object.keys(updatePayload) },
    },
  });

  return updated;
};

export const deleteProject = async (projectId, user) => {
  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!existing) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const isManager = existing.ownerId === user.id || existing.members.some((m) => m.userId === user.id && m.role === 'MANAGER');
  if (!isManager) {
    const error = new Error('Permission denied. Only the project manager can delete this project.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.project.delete({ where: { id: projectId } });
  return { id: projectId };
};

export const addProjectMember = async (projectId, userId, role = 'MEMBER', user) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const member = await prisma.projectMember.upsert({
    where: {
      projectId_userId: { projectId, userId },
    },
    update: { role },
    create: { projectId, userId, role },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: 'PROJECT_UPDATE',
      title: 'Added to Project',
      message: `You were added to project "${project.name}"`,
    },
  });

  return member;
};

export const removeProjectMember = async (projectId, userId, user) => {
  await prisma.projectMember.deleteMany({
    where: { projectId, userId },
  });
  return { projectId, userId };
};
