import { Thread, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { CreateThreadInput, UpdateThreadInput, ThreadQueryInput } from '../schemas/thread.schema';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';
import dayjs from 'dayjs';

export class ThreadService {
  async create(userId: string | null, data: CreateThreadInput) {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if user meets karma requirements
    if (userId && category.minKarmaToPost > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { karmaScore: true },
      });

      if (!user || user.karmaScore < category.minKarmaToPost) {
        throw new Error(`You need at least ${category.minKarmaToPost} karma to post in this category`);
      }
    }

    // Create thread
    const thread = await prisma.thread.create({
      data: {
        categoryId: data.categoryId,
        userId: data.isAnonymous ? null : userId,
        title: data.title,
        content: data.content,
        contentType: data.contentType,
        linkUrl: data.linkUrl,
        isAnonymous: data.isAnonymous,
        anonymousName: data.isAnonymous ? data.anonymousName : null,
        tags: data.tags,
      },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameJa: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            karmaScore: true,
          },
        },
      },
    });

    // Update category thread count
    await prisma.category.update({
      where: { id: data.categoryId },
      data: { threadCount: { increment: 1 } },
    });

    // Cache hot threads
    await this.cacheHotThread(thread);

    return thread;
  }

  async findMany(query: ThreadQueryInput, userId?: string) {
    const { page, perPage, skip } = getPaginationParams(query);

    // Build where clause
    const where: Prisma.ThreadWhereInput = {
      isRemoved: false,
      ...(query.category && {
        category: { slug: query.category },
      }),
    };

    // Build order by
    let orderBy: Prisma.ThreadOrderByWithRelationInput[] = [];
    
    switch (query.sort) {
      case 'hot':
        // Hot algorithm: score / (hours_since_post + 2)^1.5
        orderBy = [
          { score: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
      case 'new':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'top':
        orderBy = [{ score: 'desc' }];
        if (query.time) {
          const startDate = this.getTimeRangeStart(query.time);
          where.createdAt = { gte: startDate };
        }
        break;
      case 'rising':
        // Rising: recent threads with good velocity
        where.createdAt = { gte: dayjs().subtract(24, 'hours').toDate() };
        orderBy = [{ score: 'desc' }];
        break;
    }

    // Get threads
    const [threads, totalCount] = await Promise.all([
      prisma.thread.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
              nameJa: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              karmaScore: true,
            },
          },
        },
      }),
      prisma.thread.count({ where }),
    ]);

    // Get user votes if authenticated
    let userVotes = new Map<string, number>();
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          votableType: 'THREAD',
          votableId: { in: threads.map((t) => t.id) },
        },
      });
      votes.forEach((vote) => {
        userVotes.set(vote.votableId, vote.voteValue);
      });
    }

    // Format response
    const formattedThreads = threads.map((thread) => ({
      ...thread,
      userVote: userVotes.get(thread.id) || 0,
    }));

    return {
      data: formattedThreads,
      pagination: getPaginationMeta(page, perPage, totalCount),
    };
  }

  async findById(id: string, userId?: string) {
    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameJa: true,
            rules: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            karmaScore: true,
          },
        },
      },
    });

    if (!thread || thread.isRemoved) {
      throw new Error('Thread not found');
    }

    // Increment view count
    await this.incrementViewCount(id, userId);

    // Get user vote
    let userVote = 0;
    if (userId) {
      const vote = await prisma.vote.findUnique({
        where: {
          userId_votableId_votableType: {
            userId,
            votableId: id,
            votableType: 'THREAD',
          },
        },
      });
      userVote = vote?.voteValue || 0;
    }

    return {
      ...thread,
      userVote,
    };
  }

  async update(id: string, userId: string, data: UpdateThreadInput) {
    // Check if thread exists and user owns it
    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { userId: true, isRemoved: true },
    });

    if (!thread || thread.isRemoved) {
      throw new Error('Thread not found');
    }

    if (thread.userId !== userId) {
      throw new Error('You do not have permission to edit this thread');
    }

    // Update thread
    const updatedThread = await prisma.thread.update({
      where: { id },
      data: {
        content: data.content,
        tags: data.tags,
      },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            karmaScore: true,
          },
        },
      },
    });

    return updatedThread;
  }

  async delete(id: string, userId: string) {
    // Check if thread exists and user owns it
    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { userId: true, categoryId: true },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.userId !== userId) {
      throw new Error('You do not have permission to delete this thread');
    }

    // Soft delete
    await prisma.thread.update({
      where: { id },
      data: {
        isRemoved: true,
        removedReason: 'Deleted by author',
      },
    });

    // Update category thread count
    await prisma.category.update({
      where: { id: thread.categoryId },
      data: { threadCount: { decrement: 1 } },
    });

    // Remove from cache
    await redis.del(`thread:${id}`);
  }

  private async incrementViewCount(threadId: string, userId?: string) {
    const ipAddress = '127.0.0.1'; // In production, get from request
    const viewDate = new Date();

    try {
      // Record view
      await prisma.threadView.create({
        data: {
          threadId,
          userId,
          ipAddress,
          viewedAt: viewDate,
        },
      });

      // Increment view count
      await prisma.thread.update({
        where: { id: threadId },
        data: { viewCount: { increment: 1 } },
      });
    } catch (error) {
      // Ignore duplicate view errors
    }
  }

  private async cacheHotThread(thread: Thread) {
    const key = 'threads:hot';
    const score = this.calculateHotScore(thread);
    await redis.zadd(key, score, thread.id);
    
    // Keep only top 1000 threads
    await redis.zremrangebyrank(key, 0, -1001);
    
    // Set expiry
    await redis.expire(key, 60 * 60); // 1 hour
  }

  private calculateHotScore(thread: Thread): number {
    const hoursSincePost = dayjs().diff(thread.createdAt, 'hours');
    return thread.score / Math.pow(hoursSincePost + 2, 1.5);
  }

  private getTimeRangeStart(time: string): Date {
    switch (time) {
      case 'hour':
        return dayjs().subtract(1, 'hour').toDate();
      case 'day':
        return dayjs().subtract(1, 'day').toDate();
      case 'week':
        return dayjs().subtract(1, 'week').toDate();
      case 'month':
        return dayjs().subtract(1, 'month').toDate();
      case 'year':
        return dayjs().subtract(1, 'year').toDate();
      default:
        return new Date(0); // All time
    }
  }
}