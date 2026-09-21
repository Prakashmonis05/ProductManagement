import { z } from 'zod';

const dateSchema = z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional());

const optionalNumber = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const parsed = Number(val);
  return isNaN(parsed) ? undefined : parsed;
}, z.number().nonnegative().optional());

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().nullable().optional().or(z.literal('')),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    projectId: z.string().min(1, 'Project ID is required'),
    assignedToId: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
    startDate: dateSchema,
    dueDate: dateSchema,
    estimatedHours: optionalNumber,
    actualHours: optionalNumber,
    tags: z.array(z.string()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().nullable().optional().or(z.literal('')),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignedToId: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
    startDate: dateSchema,
    dueDate: dateSchema,
    estimatedHours: optionalNumber,
    actualHours: optionalNumber,
    order: z.number().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
    order: z.number().optional(),
  }),
});
