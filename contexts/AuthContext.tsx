import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

const SESSION_KEY = 'wander_mart_session';

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  updateProfile: (u: User) => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    login: () => {}, 
    logout: () => {}, 
    updateProfile: () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (u: User) => {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};