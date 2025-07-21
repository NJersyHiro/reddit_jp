'use client';

import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon as ChevronUpIconSolid, ChevronDownIcon as ChevronDownIconSolid } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'react-hot-toast';

interface VoteButtonsProps {
  threadId?: string;
  commentId?: string;
  initialScore: number;
  userVote?: 'up' | 'down' | null;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function VoteButtons({
  threadId,
  commentId,
  initialScore,
  userVote = null,
  className = '',
  orientation = 'vertical',
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote);
  const [isVoting, setIsVoting] = useState(false);
  const session = useAuthStore((state) => state.session);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!session) {
      toast.error('投票するにはログインしてください');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    const previousVote = currentVote;
    const previousScore = score;

    try {
      // Optimistic update
      if (currentVote === voteType) {
        // Remove vote
        setCurrentVote(null);
        setScore(score + (voteType === 'up' ? -1 : 1));
      } else if (currentVote === null) {
        // New vote
        setCurrentVote(voteType);
        setScore(score + (voteType === 'up' ? 1 : -1));
      } else {
        // Change vote
        setCurrentVote(voteType);
        setScore(score + (voteType === 'up' ? 2 : -2));
      }

      // API call
      if (threadId) {
        await api.voteThread(threadId, voteType);
      } else if (commentId) {
        await api.voteComment(commentId, voteType);
      }
    } catch (error) {
      // Revert on error
      setCurrentVote(previousVote);
      setScore(previousScore);
      toast.error('投票に失敗しました');
    } finally {
      setIsVoting(false);
    }
  };

  const containerClass = orientation === 'vertical' 
    ? 'flex flex-col items-center gap-1' 
    : 'flex items-center gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={`p-1 rounded transition-colors ${
          currentVote === 'up'
            ? 'text-primary-red'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
        } disabled:opacity-50`}
        aria-label="Upvote"
      >
        {currentVote === 'up' ? (
          <ChevronUpIconSolid className="w-6 h-6" />
        ) : (
          <ChevronUpIcon className="w-6 h-6" />
        )}
      </button>

      <span className={`font-bold text-sm ${
        currentVote === 'up' ? 'text-primary-red' : 
        currentVote === 'down' ? 'text-blue-600' : 
        'text-gray-700 dark:text-gray-300'
      }`}>
        {score}
      </span>

      <button
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={`p-1 rounded transition-colors ${
          currentVote === 'down'
            ? 'text-blue-600'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
        } disabled:opacity-50`}
        aria-label="Downvote"
      >
        {currentVote === 'down' ? (
          <ChevronDownIconSolid className="w-6 h-6" />
        ) : (
          <ChevronDownIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}