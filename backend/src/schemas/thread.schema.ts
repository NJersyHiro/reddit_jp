import { z } from 'zod';
import { ContentType } from '@prisma/client';

export const createThreadSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  title: z.string().min(1, 'Title is required').max(300, 'Title must be at most 300 characters'),
  content: z.string().optional(),
  contentType: z.nativeEnum(ContentType).default(ContentType.TEXT),
  linkUrl: z.string().url('Invalid URL').optional(),
  isAnonymous: z.boolean().default(false),
  anonymousName: z
    .string()
    .min(1)
    .max(50, 'Anonymous name must be at most 50 characters')
    .optional(),
  tags: z.array(z.string()).default([]),
});

export const updateThreadSchema = z.object({
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const threadQuerySchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['hot', 'new', 'top', 'rising']).default('hot'),
  time: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;
export type ThreadQueryInput = z.infer<typeof threadQuerySchema>;