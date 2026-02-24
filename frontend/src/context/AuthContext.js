import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(Cookies.get('token') || null);

  // ОПРЕДЕЛЯЕМ loadUser ПЕРЕД useEffect
  const loadUser = useCallback(async () => {
    try {
      console.log('Loading user with token:', token);
      const userData = await authAPI.getMe(token);
      console.log('User data loaded:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]); // Добавляем token как зависимость

  useEffect(() => {
    console.log('AuthProvider: token =', token);
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token, loadUser]); // Добавляем loadUser в зависимости

  const register = async (userData) => {
    console.log('Registering with:', userData);
    const response = await authAPI.register(userData);
    console.log('Register response:', response);
    setToken(response.token);
    setUser(response.user);
    Cookies.set('token', response.token, { expires: 30 });
    return response;
  };

  const login = async (credentials) => {
    console.log('Logging in with:', credentials);
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
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
    console.log('Logging out');
    setToken(null);
    setUser(null);
    Cookies.remove('token');
  };

  const submitTest = async (answers) => {
    console.log('Submitting test with answers:', answers);
    const response = await authAPI.submitTest(answers, token);
    console.log('Test submit response:', response);
    setUser({ ...user, testCompleted: true, profile: response.profile });
    return response;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      register,
      login,
      logout,
      submitTest
    }}>
      {children}
    </AuthContext.Provider>
  );
};