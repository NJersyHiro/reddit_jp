'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { Loader } from '../UI/Loader';
import { Category } from '@/types';

const threadSchema = z.object({
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  title: z.string().min(1, 'タイトルを入力してください').max(300, 'タイトルは300文字以内で入力してください'),
  content: z.string().max(40000, '本文は40000文字以内で入力してください').optional(),
  isAnonymous: z.boolean().optional(),
  anonymousName: z.string().max(50, '名前は50文字以内で入力してください').optional(),
});

type ThreadFormData = z.infer<typeof threadSchema>;

interface ThreadFormProps {
  categories: Category[];
  initialCategoryId?: string;
  onSubmit?: () => void;
  className?: string;
}

export function ThreadForm({
  categories,
  initialCategoryId,
  onSubmit,
  className = '',
}: ThreadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ThreadFormData>({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      categoryId: initialCategoryId || '',
      title: '',
      content: '',
      isAnonymous: false,
      anonymousName: '',
    },
  });

  const isAnonymous = watch('isAnonymous');

  const onSubmitForm = async (data: ThreadFormData) => {
    if (!session) {
      toast.error('投稿するにはログインしてください');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createThread({
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        isAnonymous: data.isAnonymous,
        anonymousName: data.isAnonymous ? data.anonymousName : undefined,
      });
      
      if (response && response.id) {
        toast.success('スレッドを作成しました');
        if (onSubmit) onSubmit();
        router.push(`/thread/${response.id}`);
      }
    } catch (error) {
      toast.error('スレッドの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">
          スレッドを作成するには
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
      <div className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            カテゴリ
          </label>
          <select
            id="category"
            {...register('categoryId')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
          >
            <option value="">カテゴリを選択...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                c/{category.name} - {category.nameJa}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
            placeholder="興味深いタイトルを入力..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            本文（任意）
          </label>
          <textarea
            id="content"
            {...register('content')}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100"
            placeholder="詳細を入力..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-red text-white text-sm font-medium rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader size="sm" />
                <span>投稿中...</span>
              </>
            ) : (
              <span>投稿する</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}