import axios, { AxiosInstance } from 'axios';
import { getSession } from './auth';
import { Session, Thread, Comment, Category, PaginatedResponse } from '@/types';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async (config) => {
        const session = getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.instance.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh here
          // For now, just clear session
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: { email: string; password: string; username?: string }): Promise<Session> {
    return this.instance.post('/auth/register', data);
  }

  async login(data: { email: string; password: string }): Promise<Session> {
    return this.instance.post('/auth/login', data);
  }

  async logout() {
    return this.instance.post('/auth/logout');
  }

  async getMe() {
    return this.instance.get('/auth/me');
  }

  // Category endpoints
  async getCategories(params?: { sort?: string; page?: number; perPage?: number }): Promise<PaginatedResponse<Category>> {
    return this.instance.get('/categories', { params });
  }

  async getCategory(slug: string): Promise<Category> {
    return this.instance.get(`/categories/${slug}`);
  }

  async subscribeToCategory(slug: string) {
    return this.instance.post(`/categories/${slug}/subscribe`);
  }

  async unsubscribeFromCategory(slug: string) {
    return this.instance.delete(`/categories/${slug}/subscribe`);
  }

  // Thread endpoints
  async getThreads(params?: {
    category?: string;
    sort?: string;
    time?: string;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<Thread>> {
    return this.instance.get('/threads', { params });
  }

  async getThread(id: string): Promise<Thread> {
    return this.instance.get(`/threads/${id}`);
  }

  async createThread(data: {
    categoryId: string;
    title: string;
    content?: string;
    isAnonymous?: boolean;
    anonymousName?: string;
    tags?: string[];
  }): Promise<Thread> {
    return this.instance.post('/threads', data);
  }

  async updateThread(id: string, data: { content?: string; tags?: string[] }) {
    return this.instance.put(`/threads/${id}`, data);
  }

  async deleteThread(id: string) {
    return this.instance.delete(`/threads/${id}`);
  }

  // Comment endpoints
  async getComments(threadId: string, params?: { sort?: string; depth?: number }): Promise<Comment[]> {
    return this.instance.get(`/threads/${threadId}/comments`, { params });
  }

  async createComment(data: {
    threadId: string;
    parentId?: string;
    content: string;
    isAnonymous?: boolean;
    anonymousName?: string;
  }) {
    return this.instance.post('/comments', data);
  }

  async updateComment(id: string, data: { content: string }) {
    return this.instance.put(`/comments/${id}`, data);
  }

  async deleteComment(id: string) {
    return this.instance.delete(`/comments/${id}`);
  }

  // Vote endpoints
  async vote(data: { votableId: string; votableType: 'THREAD' | 'COMMENT'; voteValue: 1 | -1 }) {
    return this.instance.post('/votes', data);
  }

  async removeVote(data: { votableId: string; votableType: 'THREAD' | 'COMMENT' }) {
    return this.instance.delete('/votes', { data });
  }
  
  async voteThread(threadId: string, voteType: 'up' | 'down') {
    return this.vote({
      votableId: threadId,
      votableType: 'THREAD',
      voteValue: voteType === 'up' ? 1 : -1,
    });
  }
  
  async voteComment(commentId: string, voteType: 'up' | 'down') {
    return this.vote({
      votableId: commentId,
      votableType: 'COMMENT',
      voteValue: voteType === 'up' ? 1 : -1,
    });
  }

  // User endpoints
  async getUser(username: string) {
    return this.instance.get(`/users/${username}`);
  }

  async updateProfile(data: { displayName?: string; bio?: string; preferences?: any }) {
    return this.instance.put('/users/me', data);
  }
  
  async getUserThreads(username: string, params?: { page?: number; perPage?: number }) {
    return this.instance.get(`/users/${username}/threads`, { params });
  }
  
  async getUserComments(username: string, params?: { page?: number; perPage?: number }) {
    return this.instance.get(`/users/${username}/comments`, { params });
  }
  
  async getCurrentUser() {
    return this.getMe();
  }
  
  async refreshToken(refreshToken: string) {
    return this.instance.post('/auth/refresh', { refreshToken });
  }
  
  async search(query: string, params?: {
    type?: 'threads' | 'comments' | 'users';
    categoryId?: string;
    page?: number;
    perPage?: number;
  }) {
    return this.instance.get('/search', {
      params: { q: query, ...params },
    });
  }
}

export const api = new ApiClient();