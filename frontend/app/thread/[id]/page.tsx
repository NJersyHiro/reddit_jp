'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/Layout/Container';
import { ThreadCard } from '@/components/Thread/ThreadCard';
import { CommentList } from '@/components/Comment/CommentList';
import { CommentForm } from '@/components/Comment/CommentForm';
import { Loader } from '@/components/UI/Loader';
import { api } from '@/lib/api';
import { Thread, Comment } from '@/types';
import { toast } from 'react-hot-toast';

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.id as string;
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [sortBy, setSortBy] = useState<'best' | 'new' | 'controversial'>('best');

  useEffect(() => {
    if (threadId) {
      fetchThread();
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    if (threadId) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const fetchThread = async () => {
    try {
      const response = await api.getThread(threadId);
      if (response) {
        setThread(response);
      }
    } catch (error) {
      toast.error('スレッドの読み込みに失敗しました');
    } finally {
      setIsLoadingThread(false);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await api.getComments(threadId, {
        sort: sortBy,
        depth: 10,
      });
      
      if (response && Array.isArray(response)) {
        // Build comment tree structure
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];
        
        // First pass: create map
        response.forEach((comment: Comment) => {
          comment.replies = [];
          commentMap.set(comment.id, comment);
        });
        
        // Second pass: build tree
        response.forEach((comment: Comment) => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
              parent.replies?.push(comment);
            }
          } else {
            rootComments.push(comment);
          }
        });
        
        setComments(rootComments);
      }
    } catch (error) {
      toast.error('コメントの読み込みに失敗しました');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = () => {
    fetchComments();
    fetchThread(); // Refresh thread to update comment count
  };

  const handleCommentReply = (comment: Comment) => {
    fetchComments();
    fetchThread(); // Refresh thread to update comment count
  };

  const handleCommentEdit = (comment: Comment) => {
    // TODO: Implement edit functionality
    toast('編集機能は開発中です', { icon: '💡' });
  };

  const handleCommentDelete = async (comment: Comment) => {
    if (!confirm('このコメントを削除しますか？')) return;
    
    try {
      await api.deleteComment(comment.id);
      toast.success('コメントを削除しました');
      fetchComments();
      fetchThread(); // Refresh thread to update comment count
    } catch (error) {
      toast.error('コメントの削除に失敗しました');
    }
  };

  if (isLoadingThread) {
    return (
      <Container>
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  if (!thread) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            スレッドが見つかりません
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            このスレッドは削除されたか、存在しません。
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <ThreadCard thread={thread} showCategory={true} className="mb-6" />
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            コメントを投稿
          </h2>
          <CommentForm
            threadId={threadId}
            onSubmit={handleCommentSubmit}
          />
        </div>
        
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              コメント ({thread.commentCount || 0})
            </h2>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'best' | 'new' | 'controversial')}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
            >
              <option value="best">ベスト</option>
              <option value="new">新着</option>
              <option value="controversial">物議</option>
            </select>
          </div>
          
          <CommentList
            comments={comments}
            isLoading={isLoadingComments}
            onReply={handleCommentReply}
            onEdit={handleCommentEdit}
            onDelete={handleCommentDelete}
          />
        </div>
      </div>
    </Container>
  );
}