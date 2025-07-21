'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/Layout/Container';
import { ThreadForm } from '@/components/Thread/ThreadForm';
import { api } from '@/lib/api';
import { Category } from '@/types';
import { toast } from 'react-hot-toast';

export default function CreateThreadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories({
        sort: 'alphabetical',
        perPage: 100,
      });
      
      // The response interceptor already extracts the data array
      if (response && Array.isArray(response)) {
        setCategories(response);
      }
    } catch (error) {
      toast.error('カテゴリの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          新しいスレッドを作成
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-red"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6">
            <ThreadForm categories={categories} />
          </div>
        )}
      </div>
    </Container>
  );
}