'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function SearchButton() {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setShowSearch(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>
      
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="absolute right-0 top-full mt-2 w-64 md:w-80"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="検索..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-red focus:border-primary-red dark:bg-dark-surface dark:text-gray-100 shadow-lg"
            autoFocus
          />
        </form>
      )}
    </div>
  );
}