import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  updateProfile: (u: User) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {}, updateProfile: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};