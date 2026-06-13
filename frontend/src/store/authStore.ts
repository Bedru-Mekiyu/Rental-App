import { create } from 'zustand';
import API from '../services/api';
import { authAPI } from '../services/apiService';
import { DEMO_USER, enableDemoMode, disableDemoMode } from '../services/demoData';

interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PM' | 'GM' | 'FS' | 'TENANT';
  phone?: string;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  pendingTwoFactor: { email: string; tempToken?: string } | null;
  init: () => void;
  login: (email: string, password: string) => Promise<{ 
    success: boolean; 
    message?: string;
    requires2FA?: boolean;
  }>;
  verify2FA: (code: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshAuthToken: () => Promise<boolean>;
  demoLogin: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
  pendingTwoFactor: null,

  init: () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ user, token, refreshToken, isAuthenticated: true, loading: false });
      } catch {
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const data = response.data;
      
      // Check if 2FA is required
      if (data.twoFactorRequired || data.user?.twoFactorEnabled) {
        set({ pendingTwoFactor: { email, tempToken: data.tempToken } });
        return { success: true, requires2FA: true };
      }
      
      const { user, token, refreshToken } = data;
      
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        pendingTwoFactor: null,
      });
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },

  verify2FA: async (code: string) => {
    const pending = get().pendingTwoFactor;
    if (!pending) {
      return { success: false, message: 'No pending 2FA verification' };
    }

    try {
      const response = await authAPI.verify2FA(code, pending.email);
      const { token, backupCodes } = response;
      
      // Fetch user info after 2FA verification
      localStorage.setItem('token', token);
      const userResponse = await API.get('/users/me');
      const user = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        pendingTwoFactor: null,
      });
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code';
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue with local logout even if API call fails
    }
    
    disableDemoMode();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      pendingTwoFactor: null,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  refreshAuthToken: async () => {
    const refreshToken = get().refreshToken || localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await authAPI.refreshToken(refreshToken);
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      set({ token: response.token, refreshToken: response.refreshToken });
      return true;
    } catch {
      return false;
    }
  },

  demoLogin: () => {
    enableDemoMode();
    set({
      user: DEMO_USER,
      token: 'demo-token',
      isAuthenticated: true,
      loading: false,
      pendingTwoFactor: null,
    });
  },
}));
