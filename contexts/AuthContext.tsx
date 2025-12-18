import React, { createContext, useContext, useState } from 'react';
import { User, AUTH_SESSION_KEY } from '../types';
import * as API from '../services/api';

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
    const saved = localStorage.getItem(AUTH_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  /**
   * Syncs UI state with the session already established by API.login() or API.register()
   */
  const login = (u: User) => {
    setUser(u);
  };

  /**
   * Calls API logout to destroy storage, then clears UI state
   */
  const logout = () => {
    API.logout();
    setUser(null);
  };

  /**
   * Updates UI state after API.updateUser() has updated the storage
   */
  const updateProfile = (u: User) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};