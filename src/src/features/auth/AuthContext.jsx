import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = () => {
    setUser({
      uid: 'admin123',
      name: 'Pedro Feitosa',
      email: 'comercial@transjordano.com.br',
      role: 'manager'
    });
    return true;
  };

  const logout = () => { setUser(null); };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
