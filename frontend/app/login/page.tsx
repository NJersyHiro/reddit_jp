'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Container } from '@/components/Layout/Container';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'react-hot-toast';
import { Loader } from '@/components/UI/Loader';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.login(data);
      
      if (response) {
        setSession(response);
        toast.success('ログインしました');
        router.push('/');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('メールアドレスまたはパスワードが正しくありません');
      } else {
        toast.error('ログインに失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              アカウントにログイン
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              アカウントをお持ちでない方は{' '}
              <Link href="/register" className="font-medium text-primary-red hover:text-primary-dark">
                新規登録
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-red focus:border-primary-red focus:z-10 sm:text-sm dark:bg-dark-surface dark:border-gray-600 dark:text-gray-100"
                  placeholder="メールアドレス"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-red focus:border-primary-red focus:z-10 sm:text-sm dark:bg-dark-surface dark:border-gray-600 dark:text-gray-100"
                  placeholder="パスワード"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  ログイン状態を保持する
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-red hover:text-primary-dark">
                  パスワードをお忘れですか？
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-red hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" />
                    <span>ログイン中...</span>
                  </div>
                ) : (
                  <span>ログイン</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}