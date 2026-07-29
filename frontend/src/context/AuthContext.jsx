import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Setup Axios default configuration
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hms_token'));
  const [loading, setLoading] = useState(true);

  // Set auth header whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('hms_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Attempt to decode user info from token or load it
      const savedUser = localStorage.getItem('hms_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
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
