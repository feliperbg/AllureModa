import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          setAuth({
            user: response.data,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        setAuth({
          user: null,
          isAuthenticated: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
