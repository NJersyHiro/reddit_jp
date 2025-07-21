import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchParams {
  query: string;
  type: 'threads' | 'comments' | 'users';
  categoryId?: string;
  page: number;
  limit: number;
  userId?: string;
}

export class SearchService {
  async search(params: SearchParams) {
    const { query, type, categoryId, page, limit, userId } = params;
    const skip = (page - 1) * limit;

    switch (type) {
      case 'threads':
        return this.searchThreads(query, categoryId, skip, limit, userId);
      case 'comments':
        return this.searchComments(query, skip, limit, userId);
      case 'users':
        return this.searchUsers(query, skip, limit);
      default:
        throw new Error('Invalid search type');
    }
  }

  private async searchThreads(
    query: string,
    categoryId: string | undefined,
    skip: number,
    limit: number,
    userId?: string
  ) {
    const whereClause: any = {
      isDeleted: false,
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      prisma.thread.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
          votes: userId ? {
            where: { userId },
            select: { value: true },
          } : false,
        },
      }),
      prisma.thread.count({ where: whereClause }),
    ]);

    const threads = data.map(thread => ({
      ...thread,
      commentCount: thread._count.comments,
      userVote: thread.votes?.[0]?.value || null,
      _count: undefined,
      votes: undefined,
    }));

    return {
      data: threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async searchComments(
    query: string,
    skip: number,
    limit: number,
    userId?: string
  ) {
    const whereClause = {
      isDeleted: false,
      content: {
        contains: query,
        mode: 'insensitive' as const,
      },
    };

    const [data, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          thread: {
            select: {
              id: true,
              title: true,
            },
          },
          votes: userId ? {
            where: { userId },
            select: { value: true },
          } : false,
        },
      }),
      prisma.comment.count({ where: whereClause }),
    ]);

    const comments = data.map(comment => ({
      ...comment,
      userVote: comment.votes?.[0]?.value || null,
      votes: undefined,
    }));

    return {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async searchUsers(
    query: string,
    skip: number,
    limit: number
  ) {
    const whereClause = {
      OR: [
        {
          username: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          displayName: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { karma: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          karma: true,
          createdAt: true,
          _count: {
            select: {
              threads: true,
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const users = data.map(user => ({
      ...user,
      threadCount: user._count.threads,
      commentCount: user._count.comments,
      _count: undefined,
    }));

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}