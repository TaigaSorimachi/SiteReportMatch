import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { setTokens, clearTokens, getAccessToken } from '@/lib/auth';
import { isDemoMode } from '@/lib/demo';
import { mockAdminUser } from '@/lib/demo-data/auth';
import type { UserSummary } from '@/types/api';

interface AuthState {
  user: UserSummary | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      if (me.role !== 'admin') {
        clearTokens();
        setUser(null);
      } else {
        setUser(me);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setTokens('demo-admin-token', 'demo-admin-refresh-token');
      setUser(mockAdminUser);
      setIsLoading(false);
      return;
    }
    const token = getAccessToken();
    if (token) {
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await authApi.adminLogin(email, password);
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
