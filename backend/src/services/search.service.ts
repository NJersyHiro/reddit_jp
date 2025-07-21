import { prisma } from '../config/database';

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
        return this.searchThreads(query, categoryId, skip, limit, page, userId);
      case 'comments':
        return this.searchComments(query, skip, limit, page, userId);
      case 'users':
        return this.searchUsers(query, skip, limit, page);
      default:
        throw new Error('Invalid search type');
    }
  }

  private async searchThreads(
    query: string,
    categoryId: string | undefined,
    skip: number,
    limit: number,
    page: number,
    userId?: string
  ) {
    const whereClause: any = {
      isRemoved: false,
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
          // votes: userId ? {
          //   where: { userId },
          //   select: { voteValue: true },
          // } : false,
        },
      }),
      prisma.thread.count({ where: whereClause }),
    ]);

    const threads = data.map(thread => ({
      ...thread,
      commentCount: thread._count.comments,
      userVote: null, // thread.votes?.[0]?.voteValue || null,
      _count: undefined,
      // votes: undefined,
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
    page: number,
    userId?: string
  ) {
    const whereClause = {
      isRemoved: false,
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
          // votes: userId ? {
          //   where: { userId },
          //   select: { voteValue: true },
          // } : false,
        },
      }),
      prisma.comment.count({ where: whereClause }),
    ]);

    const comments = data.map(comment => ({
      ...comment,
      userVote: null, // comment.votes?.[0]?.value || null,
      // votes: undefined,
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
    limit: number,
    page: number
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
          { karmaScore: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          karmaScore: true,
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