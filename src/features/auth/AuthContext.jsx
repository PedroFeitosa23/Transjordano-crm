import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // Começa vazio (null) para obrigar a tela de login a aparecer
  const [user, setUser] = useState(null);

  // O login agora apenas aprova a entrada diretamente quando o botão for clicado
  const login = () => {
    setUser({
      uid: 'admin123',
      name: 'Pedro Feitosa',
      email: 'gerente@transjordano.com.br',
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
