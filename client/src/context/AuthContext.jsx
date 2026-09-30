import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

const DEMO_ACCOUNTS = {
  USER: { email: 'traveler@example.com', password: 'Password123!' },
  VENDOR: { email: 'vendor@example.com', password: 'Password123!' },
  ADMIN: { email: 'admin@example.com', password: 'Password123!' },
  SUPPORT_AGENT: { email: 'support@example.com', password: 'Password123!' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      setAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const switchRoleDemo = async (role) => {
    const creds = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.USER;
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchRoleDemo,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
