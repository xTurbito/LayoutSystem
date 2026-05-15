import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { USER_KEY, setAuthToken } from '../api/client';
import type { User, LoginRequest } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(loadUserFromStorage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    authApi.refresh()
      .catch(() => {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    queryClient.removeQueries({ queryKey: ['profile'], exact: false });
    queryClient.removeQueries({ queryKey: ['user'], exact: false });
    navigate('/login');
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
