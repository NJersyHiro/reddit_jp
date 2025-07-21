import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { requireAuth } from '../middlewares/auth.middleware';
import { ApiResponse } from '../types/api';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService(fastify);

  // Register
  fastify.post<{
    Body: z.infer<typeof registerSchema>;
    Reply: ApiResponse;
  }>('/register', async (request, reply) => {
    try {
      const validatedData = registerSchema.parse(request.body);
      const result = await authService.register(validatedData);
      
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

  // Login
  fastify.post<{
    Body: z.infer<typeof loginSchema>;
    Reply: ApiResponse;
  }>('/login', async (request, reply) => {
    try {
      const validatedData = loginSchema.parse(request.body);
      const result = await authService.login(validatedData);
      
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
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: error.message,
        },
      });
    }
  });

  // Refresh token
  fastify.post<{
    Body: z.infer<typeof refreshTokenSchema>;
    Reply: ApiResponse;
  }>('/refresh', async (request, reply) => {
    try {
      const validatedData = refreshTokenSchema.parse(request.body);
      const result = await authService.refreshToken(validatedData.refreshToken);
      
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
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: error.message,
        },
      });
    }
  });

  // Logout
  fastify.post<{
    Reply: ApiResponse;
  }>('/logout', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '') || '';
      await authService.logout(request.user!.id, token);
      
      return reply.send({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to logout',
        },
      });
    }
  });

  // Get current user
  fastify.get<{
    Reply: ApiResponse;
  }>('/me', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user!.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          karmaScore: true,
          createdAt: true,
          preferences: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }
      
      return reply.send({
        success: true,
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get user',
        },
      });
    }
  });
};