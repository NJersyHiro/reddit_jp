import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database';
import { requireAuth } from '../middlewares/auth.middleware';
import { ApiResponse } from '../types/api';
import { z } from 'zod';

const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.object({
    language: z.enum(['ja', 'en']).optional(),
    theme: z.enum(['light', 'dark']).optional(),
    emailNotifications: z.boolean().optional(),
  }).optional(),
});

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Update current user profile
  fastify.put<{
    Body: z.infer<typeof updateUserSchema>;
    Reply: ApiResponse;
  }>('/me', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    try {
      const validatedData = updateUserSchema.parse(request.body);
      const userId = request.user!.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: validatedData.displayName,
          bio: validatedData.bio,
          preferences: validatedData.preferences
            ? {
                ...(await prisma.user
                  .findUnique({ where: { id: userId } })
                  .then((u) => u?.preferences as any || {})),
                ...validatedData.preferences,
              }
            : undefined,
        },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        karmaScore: true,
        postKarma: true,
        commentKarma: true,
        createdAt: true,
        preferences: true,
      },
    });

      return reply.send({
        success: true,
        data: user,
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
      return reply.status(500).send({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message,
        },
      });
    }
  });

  // Get user profile
  fastify.get<{
    Params: { username: string };
    Reply: ApiResponse;
  }>('/:username', async (request, reply) => {
    const { username } = request.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        karmaScore: true,
        createdAt: true,
        _count: {
          select: {
            threads: {
              where: { isRemoved: false },
            },
            comments: {
              where: { isRemoved: false },
            },
          },
        },
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
      data: {
        ...user,
        threadCount: user._count.threads,
        commentCount: user._count.comments,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  });

  // Get user's threads
  fastify.get<{
    Params: { username: string };
    Querystring: {
      page?: number;
      perPage?: number;
    };
    Reply: ApiResponse;
  }>('/:username/threads', async (request, reply) => {
    const { username } = request.params;
    const page = Math.max(1, request.query.page || 1);
    const perPage = Math.min(100, Math.max(1, request.query.perPage || 20));
    const skip = (page - 1) * perPage;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
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

    const [threads, totalCount] = await Promise.all([
      prisma.thread.findMany({
        where: {
          userId: user.id,
          isRemoved: false,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      }),
      prisma.thread.count({
        where: {
          userId: user.id,
          isRemoved: false,
        },
      }),
    ]);

    return reply.send({
      success: true,
      data: threads,
      pagination: {
        page,
        perPage,
        totalPages: Math.ceil(totalCount / perPage),
        totalCount,
        hasNext: page * perPage < totalCount,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  });
};