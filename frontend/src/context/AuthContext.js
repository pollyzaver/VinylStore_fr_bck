import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(Cookies.get('token') || null);

  const loadUser = useCallback(async () => {
    try {
      const userData = await authAPI.getMe(token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, loadUser]);

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    setToken(response.token);
    setUser(response.user);
    Cookies.set('token', response.token, { expires: 30 });
    return response;
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (!response || !response.token || !response.user) {
        console.error('Invalid login response structure:', response);
        throw new Error('Неверный формат ответа от сервера');
      }
      
      setToken(response.token);
      setUser(response.user);
      Cookies.set('token', response.token, { expires: 30 });
      return response;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};