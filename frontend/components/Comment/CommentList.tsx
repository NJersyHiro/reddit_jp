'use client';

import { Comment } from '@/types';
import { CommentCard } from './CommentCard';
import { Loader } from '../UI/Loader';

interface CommentListProps {
  comments: Comment[];
  isLoading?: boolean;
  onReply?: (comment: Comment) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
  className?: string;
}

export function CommentList({
  comments,
  isLoading = false,
  onReply,
  onEdit,
  onDelete,
  className = '',
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          まだコメントがありません
        </p>
      </div>
    );
  }

  // Filter top-level comments (no parentId)
  const topLevelComments = comments.filter(comment => !comment.parentId);

  return (
    <div className={`space-y-4 ${className}`}>
      {topLevelComments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}