'use client';

import { Thread } from '@/types';
import { ThreadCard } from './ThreadCard';
import { Loader } from '@/components/UI/Loader';

interface ThreadListProps {
  threads: Thread[];
  isLoading?: boolean;
  showCategory?: boolean;
  className?: string;
}

export function ThreadList({ 
  threads, 
  isLoading = false, 
  showCategory = true,
  className = '' 
}: ThreadListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          まだ投稿がありません
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          showCategory={showCategory}
        />
      ))}
    </div>
  );
}