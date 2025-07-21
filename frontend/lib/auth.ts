import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  karmaScore: number;
}

interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('auth-storage');
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    return parsed.state.session;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const session = getSession();
  return !!session?.accessToken;
}