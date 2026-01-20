import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Ao abrir o site, verifica se já tem alguém salvo no "cache" do navegador
  useEffect(() => {
    const savedUser = localStorage.getItem('loja_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Função de Login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('loja_user', JSON.stringify(userData));
  };

  // Função de Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('loja_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Atalho para usar o contexto
export function useAuth() {
  return useContext(AuthContext);
}