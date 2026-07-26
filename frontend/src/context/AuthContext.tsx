import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getMe, updateProfile as apiUpdateProfile } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  adminRole?: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<User>;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, loading: true,
  login: async () => ({} as User), register: async () => ({} as User),
  logout: () => {}, updateProfile: async () => ({} as User),
  redirectAfterLogin: null, setRedirectAfterLogin: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('thahirs_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('thahirs_token'));
  const [loading, setLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    () => sessionStorage.getItem('thahirs_redirect') || null
  );

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getMe()
      .then(u => setUser(u))
      .catch(() => { setToken(null); setUser(null); localStorage.removeItem('thahirs_token'); localStorage.removeItem('thahirs_user'); })
      .finally(() => setLoading(false));
  }, [token]);

  const persist = useCallback((tok: string, u: User) => {
    setToken(tok);
    setUser(u);
    localStorage.setItem('thahirs_token', tok);
    localStorage.setItem('thahirs_user', JSON.stringify(u));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (regData: RegisterData) => {
    const data = await apiRegister(regData);
    persist(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('thahirs_token');
    localStorage.removeItem('thahirs_user');
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    const updated = await apiUpdateProfile(data);
    setUser(updated);
    localStorage.setItem('thahirs_user', JSON.stringify(updated));
    return updated;
  };

  const setRedirect = (path: string | null) => {
    setRedirectAfterLogin(path);
    if (path) sessionStorage.setItem('thahirs_redirect', path);
    else sessionStorage.removeItem('thahirs_redirect');
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout, updateProfile,
      redirectAfterLogin, setRedirectAfterLogin: setRedirect,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
