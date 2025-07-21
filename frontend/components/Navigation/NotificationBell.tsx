'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/auth';

export function NotificationBell() {
  const session = useAuthStore((state) => state.session);
  
  if (!session) return null;

  return (
    <button
      className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <BellIcon className="w-5 h-5" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-primary-red rounded-full" />
    </button>
  );
}