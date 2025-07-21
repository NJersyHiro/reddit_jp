'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, PlusCircleIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, PlusCircleIcon as PlusCircleIconSolid, BellIcon as BellIconSolid, UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { useAuthStore } from '@/lib/auth';

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className = '' }: MobileBottomNavProps) {
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);

  const navItems = [
    { 
      icon: HomeIcon, 
      iconActive: HomeIconSolid, 
      label: 'ホーム', 
      href: '/' 
    },
    { 
      icon: PlusCircleIcon, 
      iconActive: PlusCircleIconSolid, 
      label: '投稿', 
      href: '/create' 
    },
    { 
      icon: BellIcon, 
      iconActive: BellIconSolid, 
      label: 'お知らせ', 
      href: session ? '/notifications' : '/login',
      badge: session ? 3 : 0 
    },
    { 
      icon: UserIcon, 
      iconActive: UserIconSolid, 
      label: '自分', 
      href: session ? `/u/${session.user?.username || session.user?.id}` : '/login' 
    },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border ${className}`}>
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconActive : item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 relative ${
                isActive ? 'text-primary-red' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1/4 w-5 h-5 bg-primary-red text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}