import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Setup Axios default configuration
export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_BASE_URL || '/api').replace(/\/$/, ''),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize token/user from localStorage on client only
  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const savedToken = localStorage.getItem('hms_token');
    const savedUser = localStorage.getItem('hms_user');
    if (savedToken) {
      setToken(savedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set auth header whenever token changes (and persist)
  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('hms_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('hms_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (error) {
      console.error('Login request failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please check server connection.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
