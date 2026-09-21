import prisma from '../config/db.js';

export const getTasks = async (user, filters = {}) => {
  const { projectId, assignedToId, status, priority, search, myTasks } = filters;

  const where = {};

  if (projectId) {
    where.projectId = projectId;
  }

  if (myTasks === 'true' || assignedToId === 'me') {
    where.assignedToId = user.id;
  } else if (assignedToId) {
    where.assignedToId = assignedToId;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (priority && priority !== 'ALL') {
    where.priority = priority;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ order: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      project: {
        select: { id: true, name: true, color: true, status: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true, avatar: true },
      },
      _count: {
        select: { comments: true, attachments: true },
      },
    },
  });

  return tasks;
};

export const getTaskById = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, name: true, color: true, status: true, ownerId: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true, avatar: true, role: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      activities: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  return task;
};

export const createTask = async (user, data) => {
  const {
    title,
    description,
    status = 'TODO',
    priority = 'MEDIUM',
    projectId,
    assignedToId,
    startDate,
    dueDate,
    estimatedHours = 0,
    actualHours = 0,
    tags = [],
  } = data;

  // Verify project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // Count existing tasks in this status to set order
  const countInStatus = await prisma.task.count({
    where: { projectId, status },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      projectId,
      assignedToId: assignedToId || null,
      createdById: user.id,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: Number(estimatedHours) || 0,
      actualHours: Number(actualHours) || 0,
      order: countInStatus,
      tags: tags || [],
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  // Notify assignee if assigned to someone else
  if (assignedToId && assignedToId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `${user.name} assigned you to "${task.title}"`,
        link: `/projects/${projectId}`,
      },
    });
  }

  // Record activity
  await prisma.activity.create({
    data: {
      userId: user.id,
      projectId,
      taskId: task.id,
      action: 'CREATED_TASK',
      metadata: { taskTitle: task.title, status: task.status },
    },
  });

  return task;
};

export const updateTask = async (taskId, user, data) => {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = Number(data.estimatedHours);
  if (data.actualHours !== undefined) updateData.actualHours = Number(data.actualHours);
  if (data.order !== undefined) updateData.order = Number(data.order);
  if (data.tags !== undefined) updateData.tags = data.tags;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  // If newly assigned to someone
  if (data.assignedToId && data.assignedToId !== existing.assignedToId && data.assignedToId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: data.assignedToId,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: `${user.name} assigned you to "${updated.title}"`,
      },
    });
  }

  await prisma.activity.create({
    data: {
      userId: user.id,
      projectId: existing.projectId,
      taskId,
      action: 'UPDATED_TASK',
      metadata: { changes: Object.keys(updateData) },
    },
  });

  return updated;
};

export const updateTaskStatus = async (taskId, user, { status, order }) => {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = existing.status;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      order: order !== undefined ? Number(order) : existing.order,
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignedTo: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true } },
    },
  });

  // Log status change activity
  if (oldStatus !== status) {
    await prisma.activity.create({
      data: {
        userId: user.id,
        projectId: existing.projectId,
        taskId,
        action: 'STATUS_CHANGED',
        metadata: { from: oldStatus, to: status },
      },
    });

    // Notify assignee if someone else changed status
    if (existing.assignedToId && existing.assignedToId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: existing.assignedToId,
          type: 'STATUS_CHANGED',
          title: 'Task Status Updated',
          message: `"${updated.title}" was moved to ${status.replace('_', ' ')} by ${user.name}`,
        },
      });
    }
  }

  return updated;
};

export const deleteTask = async (taskId, user) => {
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!existing) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  // Admin, PM owner, or task creator can delete
  if (user.role === 'TEAM_MEMBER' && existing.createdById !== user.id && existing.project.ownerId !== user.id) {
    const error = new Error('Permission denied to delete this task.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });
  return { id: taskId };
};

export const addComment = async (taskId, user, content) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId: user.id,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true, role: true } },
    },
  });

  // Notify assignee if not the author
  if (task.assignedToId && task.assignedToId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: task.assignedToId,
        type: 'COMMENT_ADDED',
        title: 'New Comment on Task',
        message: `${user.name} commented on "${task.title}"`,
      },
    });
  }

  return comment;
};

export const deleteComment = async (commentId, user) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.userId !== user.id && user.role !== 'ADMIN') {
    const error = new Error('Permission denied to delete this comment.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { id: commentId };
};
