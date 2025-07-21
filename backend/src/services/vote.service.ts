import { prisma } from '../config/database';
import { CreateVoteInput, DeleteVoteInput } from '../schemas/vote.schema';

export class VoteService {
  async vote(userId: string, data: CreateVoteInput) {
    // Verify votable exists
    const votable = await this.getVotable(data.votableId, data.votableType);
    if (!votable) {
      throw new Error(`${data.votableType.toLowerCase()} not found`);
    }

    // Get current vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_votableId_votableType: {
          userId,
          votableId: data.votableId,
          votableType: data.votableType,
        },
      },
    });

    // Calculate score changes
    let scoreChange = 0;
    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote) {
      if (existingVote.voteValue === data.voteValue) {
        // Same vote, no change
        return {
          message: 'Vote already recorded',
          newScore: votable.score,
        };
      }

      // Changing vote
      if (existingVote.voteValue === 1) {
        upvoteChange = -1;
        scoreChange = -1;
      } else {
        downvoteChange = -1;
        scoreChange = 1;
      }

      if (data.voteValue === 1) {
        upvoteChange += 1;
        scoreChange += 1;
      } else {
        downvoteChange += 1;
        scoreChange -= 1;
      }
    } else {
      // New vote
      if (data.voteValue === 1) {
        upvoteChange = 1;
        scoreChange = 1;
      } else {
        downvoteChange = 1;
        scoreChange = -1;
      }
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upsert vote
      await tx.vote.upsert({
        where: {
          userId_votableId_votableType: {
            userId,
            votableId: data.votableId,
            votableType: data.votableType,
          },
        },
        create: {
          userId,
          votableId: data.votableId,
          votableType: data.votableType,
          voteValue: data.voteValue,
        },
        update: {
          voteValue: data.voteValue,
        },
      });

      // Update votable scores
      if (data.votableType === 'THREAD') {
        const thread = await tx.thread.update({
          where: { id: data.votableId },
          data: {
            score: { increment: scoreChange },
            upvoteCount: { increment: upvoteChange },
            downvoteCount: { increment: downvoteChange },
          },
        });

        // Update user karma if not anonymous
        if (thread.userId && scoreChange !== 0) {
          await tx.user.update({
            where: { id: thread.userId },
            data: {
              karmaScore: { increment: scoreChange },
              postKarma: { increment: scoreChange },
            },
          });
        }

        return thread.score;
      } else {
        const comment = await tx.comment.update({
          where: { id: data.votableId },
          data: {
            score: { increment: scoreChange },
            upvoteCount: { increment: upvoteChange },
            downvoteCount: { increment: downvoteChange },
          },
        });

        // Update user karma if not anonymous
        if (comment.userId && scoreChange !== 0) {
          await tx.user.update({
            where: { id: comment.userId },
            data: {
              karmaScore: { increment: scoreChange },
              commentKarma: { increment: scoreChange },
            },
          });
        }

        return comment.score;
      }
    });

    return {
      message: 'Vote recorded successfully',
      newScore: result,
    };
  }

  async removeVote(userId: string, data: DeleteVoteInput) {
    // Get existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_votableId_votableType: {
          userId,
          votableId: data.votableId,
          votableType: data.votableType,
        },
      },
    });

    if (!existingVote) {
      throw new Error('Vote not found');
    }

    // Calculate score changes
    const scoreChange = existingVote.voteValue === 1 ? -1 : 1;
    const upvoteChange = existingVote.voteValue === 1 ? -1 : 0;
    const downvoteChange = existingVote.voteValue === -1 ? -1 : 0;

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Delete vote
      await tx.vote.delete({
        where: {
          userId_votableId_votableType: {
            userId,
            votableId: data.votableId,
            votableType: data.votableType,
          },
        },
      });

      // Update votable scores
      if (data.votableType === 'THREAD') {
        const thread = await tx.thread.update({
          where: { id: data.votableId },
          data: {
            score: { increment: scoreChange },
            upvoteCount: { increment: upvoteChange },
            downvoteCount: { increment: downvoteChange },
          },
        });

        // Update user karma if not anonymous
        if (thread.userId) {
          await tx.user.update({
            where: { id: thread.userId },
            data: {
              karmaScore: { increment: scoreChange },
              postKarma: { increment: scoreChange },
            },
          });
        }
      } else {
        const comment = await tx.comment.update({
          where: { id: data.votableId },
          data: {
            score: { increment: scoreChange },
            upvoteCount: { increment: upvoteChange },
            downvoteCount: { increment: downvoteChange },
          },
        });

        // Update user karma if not anonymous
        if (comment.userId) {
          await tx.user.update({
            where: { id: comment.userId },
            data: {
              karmaScore: { increment: scoreChange },
              commentKarma: { increment: scoreChange },
            },
          });
        }
      }
    });
  }

  private async getVotable(id: string, type: 'THREAD' | 'COMMENT') {
    if (type === 'THREAD') {
      return prisma.thread.findUnique({
        where: { id },
        select: { id: true, score: true, userId: true },
      });
    } else {
      return prisma.comment.findUnique({
        where: { id },
        select: { id: true, score: true, userId: true },
      });
    }
  }
}