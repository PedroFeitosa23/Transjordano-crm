import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '@/services/adapters/mock/seed';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock auto-login
    const saved = localStorage.getItem('mock_user_id');
    if (saved && MOCK_USERS[saved]) {
      setUser(MOCK_USERS[saved]);
    }
    setLoading(false);
  }, []);

  const login = async (uid) => {
    if (MOCK_USERS[uid]) {
      setUser(MOCK_USERS[uid]);
      localStorage.setItem('mock_user_id', uid);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
