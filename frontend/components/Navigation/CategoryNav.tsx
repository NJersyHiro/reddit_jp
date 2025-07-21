'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category } from '@/types';

interface CategoryNavProps {
  className?: string;
}

export function CategoryNav({ className = '' }: CategoryNavProps) {
  const pathname = usePathname();
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories({ sort: 'popular', perPage: 10 }),
  });

  const categories = categoriesData?.data || [];

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {categories.slice(0, 5).map((category: Category) => {
        const isActive = pathname === `/c/${category.slug}`;
        return (
          <Link
            key={category.id}
            href={`/c/${category.slug}`}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-red text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {category.nameJa}
          </Link>
        );
      })}
      
      {categories.length > 5 && (
        <Link
          href="/categories"
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          + その他
        </Link>
      )}
    </nav>
  );
}