import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserSummary } from '@/types/api';
import { authApi } from '@/lib/api/auth';
import { setTokens, clearTokens, getAccessToken } from '@/lib/auth';
import { initLiff, getLiffAccessToken } from '@/lib/liff';

interface AuthContextValue {
  user: UserSummary | null;
  isLoading: boolean;
  login: (liffAccessToken: string) => Promise<void>;
  devLogin: (identifier: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initLiff();
        const liffToken = getLiffAccessToken();
        if (liffToken && !getAccessToken()) {
          const res = await authApi.lineLogin(liffToken);
          setTokens(res.accessToken, res.refreshToken);
          setUser(res.user);
        } else if (getAccessToken()) {
          const me = await authApi.getMe();
          setUser(me);
        }
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (liffAccessToken: string) => {
    const res = await authApi.lineLogin(liffAccessToken);
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const devLogin = useCallback(async (identifier: string) => {
    const res = await authApi.devLogin(identifier);
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, devLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
