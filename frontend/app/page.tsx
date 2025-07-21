'use client';

import { useState, useEffect } from 'react';
import { ThreadList } from '@/components/Thread/ThreadList';
import { Container } from '@/components/Layout/Container';
import { api } from '@/lib/api';
import { Thread } from '@/types';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');

  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const fetchThreads = async () => {
    setIsLoading(true);
    try {
      const response = await api.getThreads({
        sort: sortBy,
        perPage: 20,
      });
      
      if (response && response.data) {
        setThreads(response.data);
      }
    } catch (error) {
      toast.error('スレッドの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ホーム
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">並び替え:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'hot' | 'new' | 'top')}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
            >
              <option value="hot">ホット</option>
              <option value="new">新着</option>
              <option value="top">トップ</option>
            </select>
          </div>
        </div>

        <ThreadList
          threads={threads}
          isLoading={isLoading}
          showCategory={true}
        />
      </div>
    </Container>
  );
}