import { z } from 'zod';
import { VotableType } from '@prisma/client';

export const createVoteSchema = z.object({
  votableId: z.string().uuid('Invalid votable ID'),
  votableType: z.nativeEnum(VotableType),
  voteValue: z.number().int().refine((val) => val === 1 || val === -1, {
    message: 'Vote value must be 1 or -1',
  }),
});

export const deleteVoteSchema = z.object({
  votableId: z.string().uuid('Invalid votable ID'),
  votableType: z.nativeEnum(VotableType),
});

export type CreateVoteInput = z.infer<typeof createVoteSchema>;
export type DeleteVoteInput = z.infer<typeof deleteVoteSchema>;