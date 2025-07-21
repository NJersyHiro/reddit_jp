'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Comment } from '@/types';
import { VoteButtons } from '../Thread/VoteButtons';
import { CommentForm } from './CommentForm';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CommentCardProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
  className?: string;
}

export function CommentCard({
  comment,
  onReply,
  onEdit,
  onDelete,
  className = '',
}: CommentCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  const authorDisplay = comment.isAnonymous 
    ? (comment.anonymousName || '匿名')
    : comment.user?.username || '削除されたユーザー';

  const depthPadding = Math.min(comment.depth || 0, 8) * 16;

  return (
    <div className={`relative ${className}`} style={{ paddingLeft: `${depthPadding}px` }}>
      {comment.depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" 
             style={{ left: `${depthPadding - 8}px` }} />
      )}
      
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4">
        <div className="flex items-start gap-3">
          <VoteButtons
            commentId={comment.id}
            initialScore={comment.score}
            userVote={
              comment.userVote === 1 ? 'up' : 
              comment.userVote === -1 ? 'down' : null
            }
            orientation="vertical"
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:text-gray-700 dark:hover:text-gray-200"
              >
                {isCollapsed ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronUpIcon className="w-4 h-4" />
                )}
              </button>
              <span className="font-medium">{authorDisplay}</span>
              <span>•</span>
              <span>{timeAgo}</span>
              {comment.isEdited && (
                <>
                  <span>•</span>
                  <span className="italic">編集済み</span>
                </>
              )}
            </div>
            
            {!isCollapsed && (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                  <p className="whitespace-pre-wrap">{comment.content}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  {onReply && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      返信
                    </button>
                  )}
                  
                  {onEdit && comment.user?.id === comment.user?.id && (
                    <button
                      onClick={() => onEdit(comment)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      編集
                    </button>
                  )}
                  
                  {onDelete && comment.user?.id === comment.user?.id && (
                    <button
                      onClick={() => onDelete(comment)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                    >
                      削除
                    </button>
                  )}
                </div>
                
                {showReplyForm && (
                  <div className="mt-4">
                    <CommentForm
                      threadId={comment.threadId}
                      parentId={comment.id}
                      onSubmit={() => {
                        setShowReplyForm(false);
                        if (onReply) onReply(comment);
                      }}
                      onCancel={() => setShowReplyForm(false)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && !isCollapsed && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}