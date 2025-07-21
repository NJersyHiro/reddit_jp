'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    clearSession();
    router.push('/');
  };

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="bg-primary-red text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          新規登録
        </Link>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
          {session.user?.username || session.user?.email || 'ユーザー'}
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-surface dark:divide-gray-700">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <Link
                  href={`/u/${session.user?.username || session.user?.id}`}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-800' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100`}
                >
                  プロフィール
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <Link
                  href="/settings"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-800' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100`}
                >
                  設定
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-800' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100`}
                >
                  ログアウト
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}