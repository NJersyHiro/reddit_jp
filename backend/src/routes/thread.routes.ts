import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ThreadService } from '../services/thread.service';
import { CommentService } from '../services/comment.service';
import { commentQuerySchema } from '../schemas/comment.schema';
import { createThreadSchema, updateThreadSchema, threadQuerySchema } from '../schemas/thread.schema';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api';

export const threadRoutes: FastifyPluginAsync = async (fastify) => {
  const threadService = new ThreadService();

  // List threads
  fastify.get<{
    Querystring: z.infer<typeof threadQuerySchema>;
    Reply: PaginatedResponse<any>;
  }>('/', {
    preHandler: optionalAuth,
  }, async (request, reply) => {
    try {
      const validatedQuery = threadQuerySchema.parse(request.query);
      const result = await threadService.findMany(validatedQuery, request.user?.id);

      return reply.send({
        success: true,
        ...result,
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
      throw error;
    }
  });

  // Get single thread
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse;
  }>('/:id', {
    preHandler: optionalAuth,
  }, async (request, reply) => {
    try {
      const thread = await threadService.findById(request.params.id, request.user?.id);

      return reply.send({
        success: true,
        data: thread,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'THREAD_NOT_FOUND',
          message: error.message,
        },
      });
    }
  });

  // Create thread
  fastify.post<{
    Body: z.infer<typeof createThreadSchema>;
    Reply: ApiResponse;
  }>('/', {
    preHandler: optionalAuth,
  }, async (request, reply) => {
    try {
      const validatedData = createThreadSchema.parse(request.body);
      
      // Anonymous posting is allowed, but non-anonymous requires auth
      if (!validatedData.isAnonymous && !request.user) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required for non-anonymous posting',
          },
        });
      }

      const thread = await threadService.create(request.user?.id || null, validatedData);

      return reply.status(201).send({
        success: true,
        data: thread,
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

  // Update thread
  fastify.put<{
    Params: { id: string };
    Body: z.infer<typeof updateThreadSchema>;
    Reply: ApiResponse;
  }>('/:id', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const validatedData = updateThreadSchema.parse(request.body);
      const thread = await threadService.update(
        request.params.id,
        request.user!.id,
        validatedData
      );

      return reply.send({
        success: true,
        data: thread,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      return reply.status(statusCode).send({
        success: false,
        error: {
          code: statusCode === 404 ? 'THREAD_NOT_FOUND' : 'PERMISSION_DENIED',
          message: error.message,
        },
      });
    }
  });

  // Delete thread
  fastify.delete<{
    Params: { id: string };
    Reply: ApiResponse;
  }>('/:id', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      await threadService.delete(request.params.id, request.user!.id);

      return reply.send({
        success: true,
        data: {
          message: 'Thread deleted successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      const statusCode = error.message.includes('not found') ? 404 : 403;
      return reply.status(statusCode).send({
        success: false,
        error: {
          code: statusCode === 404 ? 'THREAD_NOT_FOUND' : 'PERMISSION_DENIED',
          message: error.message,
        },
      });
    }
  });
  
  // Register comment routes for threads
  await fastify.register(threadCommentRoutes);
};

// Thread comment routes
const threadCommentRoutes: FastifyPluginAsync = async (fastify) => {
  const commentService = new CommentService();

  // Get comments for thread
  fastify.get<{
    Params: { id: string };
    Querystring: z.infer<typeof commentQuerySchema>;
    Reply: ApiResponse;
  }>('/:id/comments', {
    preHandler: optionalAuth,
  }, async (request, reply) => {
    try {
      const validatedQuery = commentQuerySchema.parse(request.query);
      const comments = await commentService.findByThreadId(
        request.params.id,
        validatedQuery,
        request.user?.id
      );

      return reply.send({
        success: true,
        data: comments,
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
      return reply.status(404).send({
        success: false,
        error: {
          code: 'THREAD_NOT_FOUND',
          message: error.message,
        },
      });
    }
  });
};