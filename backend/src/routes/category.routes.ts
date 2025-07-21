import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../config/database';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  // List categories
  fastify.get<{
    Querystring: {
      sort?: 'popular' | 'alphabetical' | 'newest';
      page?: number;
      perPage?: number;
    };
    Reply: PaginatedResponse<any>;
  }>('/', async (request, reply) => {
    const { sort = 'popular' } = request.query;
    const { page, perPage, skip } = getPaginationParams(request.query);

    let orderBy: any = {};
    switch (sort) {
      case 'popular':
        orderBy = { subscriberCount: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy,
        skip,
        take: perPage,
        select: {
          id: true,
          slug: true,
          name: true,
          nameJa: true,
          description: true,
          descriptionJa: true,
          iconUrl: true,
          subscriberCount: true,
          threadCount: true,
          isNsfw: true,
          allowsAnonymous: true,
        },
      }),
      prisma.category.count({ where: { isActive: true } }),
    ]);

    return reply.send({
      success: true,
      data: categories,
      pagination: getPaginationMeta(page, perPage, totalCount),
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  });

  // Get single category
  fastify.get<{
    Params: { slug: string };
    Reply: ApiResponse;
  }>('/:slug', {
    preHandler: optionalAuth,
  }, async (request, reply) => {
    const { slug } = request.params;
    const userId = request.user?.id;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            threads: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!category || !category.isActive) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    // Check if user is subscribed
    let isSubscribed = false;
    let userIsModerator = false;

    if (userId) {
      const [subscription, moderator] = await Promise.all([
        prisma.categorySubscription.findUnique({
          where: {
            userId_categoryId: {
              userId,
              categoryId: category.id,
            },
          },
        }),
        prisma.moderator.findUnique({
          where: {
            userId_categoryId: {
              userId,
              categoryId: category.id,
            },
          },
        }),
      ]);

      isSubscribed = !!subscription;
      userIsModerator = !!moderator;
    }

    return reply.send({
      success: true,
      data: {
        ...category,
        subscriberCount: category._count.subscriptions,
        threadCount: category._count.threads,
        isSubscribed,
        userIsModerator,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  });

  // Subscribe to category
  fastify.post<{
    Params: { slug: string };
    Reply: ApiResponse;
  }>('/:slug/subscribe', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const { slug } = request.params;
    const userId = request.user!.id;

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category || !category.isActive) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    try {
      await prisma.$transaction([
        prisma.categorySubscription.create({
          data: {
            userId,
            categoryId: category.id,
          },
        }),
        prisma.category.update({
          where: { id: category.id },
          data: { subscriberCount: { increment: 1 } },
        }),
      ]);

      return reply.send({
        success: true,
        data: {
          message: 'Subscribed successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message: 'Already subscribed to this category',
          },
        });
      }
      throw error;
    }
  });

  // Unsubscribe from category
  fastify.delete<{
    Params: { slug: string };
    Reply: ApiResponse;
  }>('/:slug/subscribe', {
    preHandler: requireAuth,
  }, async (request, reply) => {
    const { slug } = request.params;
    const userId = request.user!.id;

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }

    const subscription = await prisma.categorySubscription.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId: category.id,
        },
      },
    });

    if (!subscription) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'NOT_SUBSCRIBED',
          message: 'Not subscribed to this category',
        },
      });
    }

    await prisma.$transaction([
      prisma.categorySubscription.delete({
        where: {
          userId_categoryId: {
            userId,
            categoryId: category.id,
          },
        },
      }),
      prisma.category.update({
        where: { id: category.id },
        data: { subscriberCount: { decrement: 1 } },
      }),
    ]);

    return reply.send({
      success: true,
      data: {
        message: 'Unsubscribed successfully',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });
  });
};