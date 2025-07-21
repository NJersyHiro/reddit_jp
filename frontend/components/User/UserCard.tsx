'use client';

import Link from 'next/link';
import { User } from '@/types';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface UserCardProps {
  user: User & {
    threadCount?: number;
    commentCount?: number;
  };
  className?: string;
}

export function UserCard({ user, className = '' }: UserCardProps) {
  const memberSince = formatDistanceToNow(new Date(user.createdAt), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <Link
      href={`/u/${user.username}`}
      className={`block bg-white dark:bg-dark-surface rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName || user.username || 'User'}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {user.displayName || user.username || 'ユーザー'}
          </h3>
          
          {user.username && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.username}
            </p>
          )}
          
          {user.bio && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {user.bio}
            </p>
          )}
          
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>
              カルマ: <span className="font-medium">{user.karmaScore}</span>
            </span>
            {user.threadCount !== undefined && (
              <span>
                投稿: <span className="font-medium">{user.threadCount}</span>
              </span>
            )}
            {user.commentCount !== undefined && (
              <span>
                コメント: <span className="font-medium">{user.commentCount}</span>
              </span>
            )}
          </div>
          
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {memberSince}から参加
          </p>
        </div>
      </div>
    </Link>
  );
}