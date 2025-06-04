import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Optionally fetch user info
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, [token]);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.user.roleLevel === 1) navigate('/admin');
    else navigate('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setLoading, error, setError, notif, setNotif }}>
      {children}
    </AuthContext.Provider>
  );
}; 