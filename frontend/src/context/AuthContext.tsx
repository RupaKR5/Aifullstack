import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { getMe, login as apiLogin, register as apiRegister } from '../api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'inventrack_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return;
    }

    getMe()
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await apiLogin(email, password);
    const me = await getMe();
    setUser(me);
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    await apiRegister(email, password, name);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
