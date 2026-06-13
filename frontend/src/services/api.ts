import axios from 'axios';
import { toast } from 'sonner';

// Create axios instance with base configuration
// Uses VITE_API_URL environment variable, falls back to localhost for development
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Request failed', {
      description: 'Failed to send request. Please try again.',
    });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with toast notifications
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Handle different error types
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired', {
        description: 'Please log in again.',
      });
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('Access denied', {
        description: 'You do not have permission to perform this action.',
      });
    } else if (status === 404) {
      toast.error('Not found', {
        description: message || 'The requested resource was not found.',
      });
    } else if (status === 422 || status === 400) {
      toast.error('Validation error', {
        description: message || 'Please check your input and try again.',
      });
    } else if (status >= 500) {
      toast.error('Server error', {
        description: 'Something went wrong on our end. Please try again later.',
      });
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout', {
        description: 'The server took too long to respond. Please try again.',
      });
    } else if (!error.response) {
      toast.error('Network error', {
        description: 'Unable to connect to the server. Check your internet connection.',
      });
    }

    return Promise.reject(error);
  }
);

// Install demo mode interceptor
import { createDemoInterceptor } from './demoData';
createDemoInterceptor(API);

export default API;
