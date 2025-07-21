import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { VoteService } from '../services/vote.service';
import { createVoteSchema, deleteVoteSchema } from '../schemas/vote.schema';
import { requireAuth } from '../middlewares/auth.middleware';
import { ApiResponse } from '../types/api';

export const voteRoutes: FastifyPluginAsync = async (fastify) => {
  const voteService = new VoteService();

  // Create or update vote
  fastify.post<{
    Body: z.infer<typeof createVoteSchema>;
    Reply: ApiResponse;
  }>('/', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const validatedData = createVoteSchema.parse(request.body);
      const result = await voteService.vote(request.user!.id, validatedData);

      return reply.send({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors[0].message,
            details: error.errors,
          },
        });
      }
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }
  });

  // Remove vote
  fastify.delete<{
    Body: z.infer<typeof deleteVoteSchema>;
    Reply: ApiResponse;
  }>('/', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const validatedData = deleteVoteSchema.parse(request.body);
      await voteService.removeVote(request.user!.id, validatedData);

      return reply.send({
        success: true,
        data: {
          message: 'Vote removed successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors[0].message,
            details: error.errors,
          },
        });
      }
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }
  });
};