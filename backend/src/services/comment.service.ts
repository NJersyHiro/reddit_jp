import { Comment, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateCommentInput, UpdateCommentInput, CommentQueryInput } from '../schemas/comment.schema';

export class CommentService {
  async create(userId: string | null, data: CreateCommentInput) {
    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: data.threadId },
      select: { id: true, isLocked: true, isRemoved: true },
    });

    if (!thread || thread.isRemoved) {
      throw new Error('Thread not found');
    }

    if (thread.isLocked) {
      throw new Error('Thread is locked');
    }

    // Generate path for nested comments
    let path = '';
    let depth = 0;

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { path: true, depth: true, threadId: true },
      });

      if (!parent) {
        throw new Error('Parent comment not found');
      }

      if (parent.threadId !== data.threadId) {
        throw new Error('Parent comment belongs to different thread');
      }

      path = parent.path ? `${parent.path}.${data.parentId}` : data.parentId;
      depth = parent.depth + 1;
    }

    // Create comment
    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          threadId: data.threadId,
          parentId: data.parentId,
          userId: data.isAnonymous ? null : userId,
          content: data.content,
          isAnonymous: data.isAnonymous,
          anonymousName: data.isAnonymous ? data.anonymousName : null,
          path,
          depth,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              karmaScore: true,
            },
          },
        },
      });

      // Update thread comment count and last activity
      await tx.thread.update({
        where: { id: data.threadId },
        data: {
          commentCount: { increment: 1 },
          lastActivityAt: new Date(),
        },
      });

      // Update parent comment reply count
      if (data.parentId) {
        await tx.comment.update({
          where: { id: data.parentId },
          data: { replyCount: { increment: 1 } },
        });
      }

      return newComment;
    });

    return comment;
  }

  async findByThreadId(threadId: string, query: CommentQueryInput, userId?: string) {
    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { id: true },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    // Build order by
    let orderBy: Prisma.CommentOrderByWithRelationInput[] = [];
    
    switch (query.sort) {
      case 'best':
        // Best algorithm: score with time decay
        orderBy = [
          { score: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
      case 'new':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'old':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'controversial':
        // Controversial: high activity but balanced votes
        orderBy = [
          { upvoteCount: 'desc' },
          { downvoteCount: 'desc' },
        ];
        break;
    }

    // Get top-level comments
    const comments = await prisma.comment.findMany({
      where: {
        threadId,
        isRemoved: false,
        parentId: null,
      },
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            karmaScore: true,
          },
        },
      },
    });

    // Get user votes if authenticated
    let userVotes = new Map<string, number>();
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          votableType: 'COMMENT',
          votableId: { in: comments.map((c) => c.id) },
        },
      });
      votes.forEach((vote) => {
        userVotes.set(vote.votableId, vote.voteValue);
      });
    }

    // Build comment tree
    const commentTree = await this.buildCommentTree(
      comments,
      threadId,
      query.depth,
      userVotes,
      userId
    );

    return commentTree;
  }

  async update(id: string, userId: string, data: UpdateCommentInput) {
    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true, isRemoved: true },
    });

    if (!comment || comment.isRemoved) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('You do not have permission to edit this comment');
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: data.content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            karmaScore: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async delete(id: string, userId: string) {
    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true, threadId: true, parentId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('You do not have permission to delete this comment');
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete
      await tx.comment.update({
        where: { id },
        data: {
          isRemoved: true,
          removedReason: 'Deleted by author',
          content: '[deleted]',
        },
      });

      // Update thread comment count
      await tx.thread.update({
        where: { id: comment.threadId },
        data: { commentCount: { decrement: 1 } },
      });

      // Update parent comment reply count
      if (comment.parentId) {
        await tx.comment.update({
          where: { id: comment.parentId },
          data: { replyCount: { decrement: 1 } },
        });
      }
    });
  }

  private async buildCommentTree(
    comments: any[],
    threadId: string,
    maxDepth: number,
    userVotes: Map<string, number>,
    userId?: string,
    currentDepth: number = 0
  ): Promise<any[]> {
    if (currentDepth >= maxDepth) {
      return comments.map((comment) => ({
        ...comment,
        userVote: userVotes.get(comment.id) || 0,
        replies: [],
      }));
    }

    const commentIds = comments.map((c) => c.id);
    
    // Get all replies for these comments
    const replies = await prisma.comment.findMany({
      where: {
        threadId,
        parentId: { in: commentIds },
        isRemoved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            karmaScore: true,
          },
        },
      },
    });

    // Get user votes for replies
    if (userId && replies.length > 0) {
      const replyVotes = await prisma.vote.findMany({
        where: {
          userId,
          votableType: 'COMMENT',
          votableId: { in: replies.map((r) => r.id) },
        },
      });
      replyVotes.forEach((vote) => {
        userVotes.set(vote.votableId, vote.voteValue);
      });
    }

    // Group replies by parent
    const repliesByParent = new Map<string, any[]>();
    replies.forEach((reply) => {
      if (!repliesByParent.has(reply.parentId!)) {
        repliesByParent.set(reply.parentId!, []);
      }
      repliesByParent.get(reply.parentId!)!.push(reply);
    });

    // Build tree recursively
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const commentReplies = repliesByParent.get(comment.id) || [];
        const nestedReplies = await this.buildCommentTree(
          commentReplies,
          threadId,
          maxDepth,
          userVotes,
          userId,
          currentDepth + 1
        );

        return {
          ...comment,
          userVote: userVotes.get(comment.id) || 0,
          replies: nestedReplies,
        };
      })
    );

    return commentsWithReplies;
  }
}