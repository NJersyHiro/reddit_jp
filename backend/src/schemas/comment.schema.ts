import { z } from 'zod';

export const createCommentSchema = z.object({
  threadId: z.string().uuid('Invalid thread ID'),
  parentId: z.string().uuid('Invalid parent ID').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
  isAnonymous: z.boolean().default(false),
  anonymousName: z
    .string()
    .min(1)
    .max(50, 'Anonymous name must be at most 50 characters')
    .optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
});

export const commentQuerySchema = z.object({
  sort: z.enum(['best', 'new', 'old', 'controversial']).default('best'),
  depth: z.coerce.number().int().positive().max(10).default(5),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentQueryInput = z.infer<typeof commentQuerySchema>;