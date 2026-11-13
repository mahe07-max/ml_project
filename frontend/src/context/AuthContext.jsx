import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem('agriwise_token') || '');
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('agriwise_user');
    return userData ? JSON.parse(userData) : null;
  });

  const setToken = (newToken, newUser = null) => {
    setTokenState(newToken);
    setAuthToken(newToken);
    localStorage.setItem('agriwise_token', newToken || '');
    if (newUser) {
      localStorage.setItem('agriwise_user', JSON.stringify(newUser));
      setUser(newUser);
    } else if (!newToken) {
      localStorage.removeItem('agriwise_user');
      setUser(null);
    }
  };

  const logout = () => {
    setToken('', null);
  };

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const value = useMemo(
    () => ({ token, user, setToken, logout }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
