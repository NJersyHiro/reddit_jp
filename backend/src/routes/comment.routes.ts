import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { CommentService } from '../services/comment.service';
import { createCommentSchema, updateCommentSchema, commentQuerySchema } from '../schemas/comment.schema';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { ApiResponse } from '../types/api';

export const commentRoutes: FastifyPluginAsync = async (fastify) => {
  const commentService = new CommentService();

  // Create comment
  fastify.post<{
    Body: z.infer<typeof createCommentSchema>;
    Reply: ApiResponse;
  }>('/', {
    preHandler: optionalAuth,
  }, async (request, reply) => {
    try {
      const validatedData = createCommentSchema.parse(request.body);
      
      // Anonymous posting is allowed, but non-anonymous requires auth
      if (!validatedData.isAnonymous && !request.user) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required for non-anonymous commenting',
          },
        });
      }

      const comment = await commentService.create(request.user?.id || null, validatedData);

      return reply.status(201).send({
        success: true,
        data: comment,
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

  // Update comment
  fastify.put<{
    Params: { id: string };
    Body: z.infer<typeof updateCommentSchema>;
    Reply: ApiResponse;
  }>('/:id', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const validatedData = updateCommentSchema.parse(request.body);
      const comment = await commentService.update(
        request.params.id,
        request.user!.id,
        validatedData
      );

      return reply.send({
        success: true,
        data: comment,
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
          code: statusCode === 404 ? 'COMMENT_NOT_FOUND' : 'PERMISSION_DENIED',
          message: error.message,
        },
      });
    }
  });

  // Delete comment
  fastify.delete<{
    Params: { id: string };
    Reply: ApiResponse;
  }>('/:id', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      await commentService.delete(request.params.id, request.user!.id);

      return reply.send({
        success: true,
        data: {
          message: 'Comment deleted successfully',
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
          code: statusCode === 404 ? 'COMMENT_NOT_FOUND' : 'PERMISSION_DENIED',
          message: error.message,
        },
      });
    }
  });
};

// Add this route to thread.routes.ts
export const threadCommentRoutes: FastifyPluginAsync = async (fastify) => {
  const commentService = new CommentService();

  // Get comments for thread
  fastify.get<{
    Params: { threadId: string };
    Querystring: typeof commentQuerySchema._type;
    Reply: ApiResponse;
  }>('/:threadId/comments', {
    schema: {
      querystring: commentQuerySchema,
    },
    preHandler: optionalAuth,
  }, async (request, reply) => {
    try {
      const comments = await commentService.findByThreadId(
        request.params.threadId,
        request.query,
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