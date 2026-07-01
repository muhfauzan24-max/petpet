import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from token
  useEffect(() => {
    const token = sessionStorage.getItem('petplace_token');
    if (token) {
      authAPI.me()
        .then((data) => {
          setUser(data);
        })
        .catch(() => {
          // Token expired or invalid
          sessionStorage.removeItem('petplace_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    if (token) sessionStorage.setItem('petplace_token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {}
    sessionStorage.removeItem('petplace_token');
    setUser(null);
  };

  const loginWithCredentials = async (email, password) => {
    const result = await authAPI.login(email, password);
    if (result.token) {
      sessionStorage.setItem('petplace_token', result.token);
      setUser(result.user);
      return result.user;
    }
    throw new Error('Login gagal');
  };

  const register = async (data) => {
    const result = await authAPI.register(data);
    if (result.token) {
      sessionStorage.setItem('petplace_token', result.token);
      setUser(result.user);
      return result.user;
    }
    throw new Error('Registrasi gagal');
  };

  const daftarKios = async (kiosData) => {
    if (!user) throw new Error('Harus login dulu');
    const { kiosAPI } = await import('../services/api');
    const result = await kiosAPI.daftar(kiosData);

    // Refresh user data
    const freshUser = await authAPI.me();
    setUser(freshUser);
    return result;
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithCredentials, daftarKios, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
