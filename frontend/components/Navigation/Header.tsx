'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { CategoryNav } from './CategoryNav';
import { UserMenu } from './UserMenu';
import { SearchButton } from './SearchButton';
import { NotificationBell } from './NotificationBell';

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <CategoryNav className="hidden md:flex" />
          </div>
          
          <div className="flex items-center gap-4">
            <SearchButton />
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}