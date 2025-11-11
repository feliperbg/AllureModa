
import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, isAuthenticated: false });

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await apiClient.get('/auth/me');
        setAuth({ user: data, isAuthenticated: true });
      } catch (err) {
        setAuth({ user: null, isAuthenticated: false });
      }
    };
    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
