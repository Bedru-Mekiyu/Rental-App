import { create } from "zustand";
// import axios from 'axios';

export const useAuthStore = create((set) => ({
  user: {
    role: "ADMIN", // or PM / GM / FS / TENANT
    name: "Dev User",
  },
  loading: false,
}));

// export const useAuthStore = create((set) => ({
//   user: null,
//   loading: true,
//   init: () => {
//     const token = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');
//     if (token && storedUser) {
//       set({ user: JSON.parse(storedUser), loading: false });
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//       set({ loading: false });
//     }
//   },
//   login: async (email, password) => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
//       const { token, user } = res.data;
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       set({ user });
//       return { success: true };
//     } catch (err) {
//       return { success: false, message: err.response?.data?.message || 'Login failed' };
//     }
//   },
//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     delete axios.defaults.headers.common['Authorization'];
//     set({ user: null });
//   },
// }));
