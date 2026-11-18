/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have an existing token or cookie session, check user
    checkAuth();

    const handleSessionLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleSessionLogout);
    return () => window.removeEventListener('auth:logout', handleSessionLogout);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const userData = res.data?.user;
    setUser(userData);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const registeredUser = res.data?.user;
    setUser(registeredUser);
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
