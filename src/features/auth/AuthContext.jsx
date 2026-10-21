import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // Cria um utilizador fixo que entra automaticamente no sistema
  const [user] = useState({
    uid: 'admin123',
    name: 'Pedro Feitosa',
    email: 'gerente@transjordano.com.br',
    role: 'manager'
  });

  const login = () => true;
  const logout = () => { window.location.href = '/'; };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
