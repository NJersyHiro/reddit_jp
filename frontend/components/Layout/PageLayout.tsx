'use client';

import { ReactNode } from 'react';
import { Header } from '../Navigation/Header';
import { MobileBottomNav } from '../Navigation/MobileBottomNav';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <main className="pb-20 pt-16 md:pb-0">{children}</main>
      <MobileBottomNav className="md:hidden" />
    </div>
  );
}