// ============================================================
// AuthContext + ThemeContext — single file, named exports
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react';
import { userApi, authApi } from '../services/api';

// ── Theme ───────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleTheme = () => {};
  return <ThemeContext.Provider value={{ theme: 'dark', toggleTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

// ── Auth ────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) fetchProfile();
    else setLoading(false);
  }, []);

  async function fetchProfile() {
    try {
      const { data } = await userApi.getProfile();
      setUser(data.data);
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const { data } = await authApi.login(credentials);
    if (data.data.otpRequired) {
      return data.data;
    }
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  }

  async function verifyOtp(usernameOrEmail, otp) {
    const { data } = await authApi.verifyOtp({ usernameOrEmail, otp });
    localStorage.setItem('accessToken',  data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  }

  async function register(payload) {
    const { data } = await authApi.register(payload);
    return data;
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, loading,
      login, verifyOtp, register, logout, fetchProfile,
      isAdmin:    user?.roles?.includes('ROLE_ADMIN'),
      isEmployee: user?.roles?.includes('ROLE_EMPLOYEE'),
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
