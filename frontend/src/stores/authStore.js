import { create } from 'zustand';
import { login, register, checkAuth, logout } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await login(credentials);
      set({ user: response.user, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await register(userData);
      set({ loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  logout: async () => {
    await logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await checkAuth();
      if (response.user) {
        set({ user: response.user, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  }
}));
