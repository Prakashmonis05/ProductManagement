import { z } from 'zod';

const dateSchema = z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional());
const optionalString = z.preprocess((val) => (val === '' ? undefined : val), z.string().max(1000).optional());

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(100),
    description: z.string().max(1000).nullable().optional().or(z.literal('')),
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    color: z.string().optional(),
    startDate: dateSchema,
    dueDate: dateSchema,
    memberIds: z.array(z.string()).optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).nullable().optional().or(z.literal('')),
    status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    color: z.string().optional(),
    startDate: dateSchema,
    dueDate: dateSchema,
    memberIds: z.array(z.string()).optional(),
  }),
});
