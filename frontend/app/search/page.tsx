'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/Layout/Container';
import { ThreadList } from '@/components/Thread/ThreadList';
import { CommentCard } from '@/components/Comment/CommentCard';
import { UserCard } from '@/components/User/UserCard';
import { Loader } from '@/components/UI/Loader';
import { api } from '@/lib/api';
import { Thread, Comment, User } from '@/types';
import { toast } from 'react-hot-toast';

type SearchType = 'threads' | 'comments' | 'users';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') as SearchType) || 'threads';

  const [results, setResults] = useState<Thread[] | Comment[] | User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(type);
  const [searchQuery, setSearchQuery] = useState(query);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (query) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.search(searchQuery, {
        type: searchType,
        page,
        perPage: 20,
      });

      if (response && response.data) {
        setResults(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      toast.error('検索に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    performSearch();
  };

  const handleTypeChange = (newType: SearchType) => {
    setSearchType(newType);
    setPage(1);
    if (searchQuery) {
      performSearch();
    }
  };

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          検索
        </h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索キーワードを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              className="px-6 py-2 bg-primary-red text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              検索
            </button>
          </div>
        </form>

        <div className="mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => handleTypeChange('threads')}
              className={`px-4 py-2 rounded-md ${
                searchType === 'threads'
                  ? 'bg-primary-red text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              スレッド
            </button>
            <button
              onClick={() => handleTypeChange('comments')}
              className={`px-4 py-2 rounded-md ${
                searchType === 'comments'
                  ? 'bg-primary-red text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              コメント
            </button>
            <button
              onClick={() => handleTypeChange('users')}
              className={`px-4 py-2 rounded-md ${
                searchType === 'users'
                  ? 'bg-primary-red text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              ユーザー
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : results.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              「{searchQuery}」に一致する{searchType === 'threads' ? 'スレッド' : searchType === 'comments' ? 'コメント' : 'ユーザー'}が見つかりませんでした
            </p>
          </div>
        ) : (
          <>
            {searchType === 'threads' && (
              <ThreadList threads={results as Thread[]} showCategory={true} />
            )}
            {searchType === 'comments' && (
              <div className="space-y-4">
                {(results as Comment[]).map((comment) => (
                  <CommentCard key={comment.id} comment={comment} className="bg-white dark:bg-dark-surface rounded-lg p-4" />
                ))}
              </div>
            )}
            {searchType === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(results as User[]).map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setPage(page - 1);
                    performSearch();
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  前へ
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => {
                    setPage(page + 1);
                    performSearch();
                  }}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}