// src/context/AuthContext.js
'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        const decodedUser = jwtDecode(storedToken);
        if (decodedUser.exp * 1000 < Date.now()) {
          // If token is expired, remove it.
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        } else {
          // If token is valid, set the user.
          setUser(decodedUser.user);
          setToken(storedToken);
        }
      }
    } catch (error) {
      console.error('Gagal memuat token:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken) => {
    const decodedUser = jwtDecode(newToken);
    localStorage.setItem('token', newToken);
    setUser(decodedUser.user);
    setToken(newToken);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
