export interface Category {
  id: string;
  slug: string;
  name: string;
  nameJa: string;
  description?: string;
  descriptionJa?: string;
  iconUrl?: string;
  subscriberCount: number;
  threadCount: number;
  isNsfw: boolean;
  allowsAnonymous: boolean;
  isSubscribed?: boolean;
  userIsModerator?: boolean;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  karmaScore: number;
  bio?: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Thread {
  id: string;
  category: {
    id: string;
    slug: string;
    name: string;
    nameJa: string;
  };
  user?: User;
  title: string;
  content?: string;
  contentType: 'TEXT' | 'LINK' | 'IMAGE';
  linkUrl?: string;
  isAnonymous: boolean;
  anonymousName?: string;
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userVote?: -1 | 0 | 1;
}

export interface Comment {
  id: string;
  threadId: string;
  parentId?: string;
  user?: User;
  content: string;
  isAnonymous: boolean;
  anonymousName?: string;
  score: number;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  depth: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  userVote?: -1 | 0 | 1;
  replies?: Comment[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface CreateThreadInput {
  categoryId: string;
  title: string;
  content?: string;
  isAnonymous?: boolean;
  anonymousName?: string;
}

export interface CreateCommentInput {
  threadId: string;
  parentId?: string;
  content: string;
  isAnonymous?: boolean;
  anonymousName?: string;
}

export interface Vote {
  id: string;
  userId: string;
  threadId?: string;
  commentId?: string;
  value: 1 | -1;
  createdAt: string;
}