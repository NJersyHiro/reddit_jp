'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Thread } from '@/types';
import { VoteButtons } from './VoteButtons';
import { ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';

interface ThreadCardProps {
  thread: Thread;
  className?: string;
  showCategory?: boolean;
}

export function ThreadCard({ thread, className = '', showCategory = true }: ThreadCardProps) {
  const timeAgo = formatDistanceToNow(new Date(thread.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  const authorDisplay = thread.isAnonymous 
    ? (thread.anonymousName || '匿名')
    : thread.user?.username || '削除されたユーザー';

  return (
    <article className={`bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex">
        <VoteButtons
          threadId={thread.id}
          initialScore={thread.score}
          userVote={
            thread.userVote === 1 ? 'up' : 
            thread.userVote === -1 ? 'down' : null
          }
          className="p-2 pr-0"
        />
        
        <div className="flex-1 p-4 pl-2">
          {showCategory && thread.category && (
            <Link
              href={`/c/${thread.category.slug}`}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              c/{thread.category.name}
            </Link>
          )}
          
          <h3 className="mt-1 mb-2">
            <Link
              href={`/thread/${thread.id}`}
              className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-primary-red dark:hover:text-primary-light line-clamp-2"
            >
              {thread.title}
            </Link>
          </h3>
          
          {thread.content && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
              {thread.content}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              投稿者: <span className="font-medium">{authorDisplay}</span>
            </span>
            <span>{timeAgo}</span>
            <Link
              href={`/thread/${thread.id}#comments`}
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{thread.commentCount || 0} コメント</span>
            </Link>
            <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200">
              <ShareIcon className="w-4 h-4" />
              <span>共有</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}