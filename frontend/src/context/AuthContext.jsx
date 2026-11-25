import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sms_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sms_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('sms_auth_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
        } catch (err) {
          console.warn('Session verification error:', err);
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'Academic Coordinator' || user.is_staff);
  const isTeacher = user && (user.role === 'teacher' || user.role === 'Teacher');
  const isStudent = user && (user.role === 'student' || user.role === 'Student');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isTeacher,
        isStudent,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
