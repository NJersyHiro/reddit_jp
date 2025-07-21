'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { Loader } from '../UI/Loader';

const commentSchema = z.object({
  content: z.string().min(1, 'コメントを入力してください').max(10000, 'コメントは10000文字以内で入力してください'),
  isAnonymous: z.boolean().optional(),
  anonymousName: z.string().max(50, '名前は50文字以内で入力してください').optional(),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  threadId: string;
  parentId?: string;
  initialContent?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CommentForm({
  threadId,
  parentId,
  initialContent = '',
  onSubmit,
  onCancel,
  className = '',
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useAuthStore((state) => state.session);
  
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: initialContent,
      isAnonymous: false,
      anonymousName: '',
    },
  });

  const isAnonymous = watch('isAnonymous');

  const onSubmitForm = async (data: CommentFormData) => {
    if (!session) {
      toast.error('コメントするにはログインしてください');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createComment({
        threadId,
        parentId,
        content: data.content,
        isAnonymous: data.isAnonymous,
        anonymousName: data.isAnonymous ? data.anonymousName : undefined,
      });
      
      if (response) {
        toast.success('コメントを投稿しました');
        reset();
        if (onSubmit) onSubmit();
      }
    } catch (error) {
      toast.error('コメントの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">
          コメントするには
          <a href="/login" className="text-primary-red hover:underline mx-1">
            ログイン
          </a>
          してください
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className={className}>
      <div className="space-y-4">
        <div>
          <textarea
            {...register('content')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
            placeholder="コメントを入力..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isAnonymous')}
              className="rounded border-gray-300 text-primary-red focus:ring-primary-red"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              匿名で投稿する
            </span>
          </label>

          {isAnonymous && (
            <div>
              <input
                type="text"
                {...register('anonymousName')}
                placeholder="匿名の名前（任意）"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
              />
              {errors.anonymousName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.anonymousName.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-red text-white text-sm font-medium rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" />
                <span>投稿中...</span>
              </>
            ) : (
              <span>コメントする</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}