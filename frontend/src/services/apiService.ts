import API from './api';

// ============================================
// Type Definitions based on API Reference
// ============================================

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PM' | 'GM' | 'FS' | 'TENANT';
  phone?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  refreshToken?: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  secret: string;
  qrCode: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  token: string;
  backupCodes?: string[];
}

export interface Property {
  id: string;
  _id?: string;
  name: string;
  address: string;
  city?: string;
  zipCode?: string;
  description?: string;
  totalUnits: number;
  occupiedUnits: number;
}

export interface Unit {
  id: string;
  _id?: string;
  propertyId: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Lease {
  id: string;
  _id?: string;
  tenantId: User | string;
  unitId: Unit | string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  monthlyRentEtb?: number;
  taxRate?: number;
}

export interface Payment {
  id: string;
  _id?: string;
  leaseId: string;
  amount: number;
  amountEtb?: number;
  paymentMethod: string;
  referenceNumber?: string;
  externalTransactionId?: string;
  status: 'pending' | 'verified' | 'rejected' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  transactionDate: string;
  proofUrl?: string;
}

export interface Invoice {
  id: string;
  _id?: string;
  leaseId: string;
  dueDate: string;
  items: { description: string; amount: number }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Dispute {
  id: string;
  _id?: string;
  paymentId: string;
  reason: string;
  description: string;
  status: 'open' | 'resolved' | 'rejected';
  resolution?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  type: string;
  status: 'read' | 'unread';
  createdAt: string;
}

export interface DashboardAnalytics {
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  pendingPayments: number;
  totalCollected: number;
  averagePaymentDays: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: string;
  }) => {
    const response = await API.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await API.post<AuthResponse & { twoFactorRequired?: boolean }>(
      '/auth/login',
      { email, password }
    );
    return response.data;
  },

  logout: async () => {
    const response = await API.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await API.post<{ token: string; refreshToken: string }>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await API.post('/auth/reset-password', { token, password });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await API.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // 2FA endpoints
  setup2FA: async (method: string = 'totp') => {
    const response = await API.post<TwoFactorSetupResponse>('/auth/2fa/setup', { method });
    return response.data;
  },

  verify2FA: async (code: string, email?: string) => {
    const response = await API.post<TwoFactorVerifyResponse>('/auth/2fa/verify', {
      code,
      email,
    });
    return response.data;
  },

  enable2FA: async (code: string) => {
    const response = await API.post<{ backupCodes: string[] }>('/auth/2fa/enable', { code });
    return response.data;
  },

  disable2FA: async (code: string) => {
    const response = await API.post('/auth/2fa/disable', { code });
    return response.data;
  },
};

// ============================================
// Properties API
// ============================================

export const propertiesAPI = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await API.get<PaginatedResponse<Property> | Property[]>('/properties', {
      params,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<Property>(`/properties/${id}`);
    return response.data;
  },

  create: async (data: Partial<Property>) => {
    const response = await API.post<Property>('/properties', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Property>) => {
    const response = await API.put<Property>(`/properties/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await API.delete(`/properties/${id}`);
    return response.data;
  },
};

// ============================================
// Units API
// ============================================

export const unitsAPI = {
  list: async (params?: { propertyId?: string; status?: string }) => {
    const response = await API.get<Unit[]>('/units', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<Unit>(`/units/${id}`);
    return response.data;
  },

  create: async (data: Partial<Unit>) => {
    const response = await API.post<Unit>('/units', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Unit>) => {
    const response = await API.put<Unit>(`/units/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await API.delete(`/units/${id}`);
    return response.data;
  },
};

// ============================================
// Leases API
// ============================================

export const leasesAPI = {
  list: async (params?: { status?: string; tenantId?: string }) => {
    const response = await API.get<Lease[]>('/leases', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<Lease>(`/leases/${id}`);
    return response.data;
  },

  create: async (data: Partial<Lease>) => {
    const response = await API.post<Lease>('/leases', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Lease>) => {
    const response = await API.put<Lease>(`/leases/${id}`, data);
    return response.data;
  },

  terminate: async (id: string, data?: { terminationDate?: string; reason?: string }) => {
    const response = await API.post<Lease>(`/leases/${id}/terminate`, data);
    return response.data;
  },

  // Legacy endpoint for backward compatibility
  end: async (id: string, data?: any) => {
    try {
      const response = await API.post<Lease>(`/leases/${id}/terminate`, data);
      return response.data;
    } catch {
      // Fallback to legacy endpoint
      const response = await API.patch<Lease>(`/leases/${id}/end`, data);
      return response.data;
    }
  },
};

// ============================================
// Payments API
// ============================================

export const paymentsAPI = {
  list: async (params?: { status?: string; leaseId?: string; page?: number }) => {
    const response = await API.get<Payment[]>('/payments', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  create: async (data: {
    leaseId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
  }) => {
    const response = await API.post<Payment>('/payments', data);
    return response.data;
  },

  uploadProof: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await API.post<{ proofUrl: string }>(`/payments/${id}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  verify: async (id: string, status: 'verified' | 'rejected' | 'VERIFIED' | 'REJECTED') => {
    const response = await API.post<Payment>(`/payments/${id}/verify`, { status });
    return response.data;
  },

  // Legacy endpoint for status updates
  updateStatus: async (id: string, status: string) => {
    try {
      const response = await API.post<Payment>(`/payments/${id}/verify`, { status: status.toLowerCase() });
      return response.data;
    } catch {
      const response = await API.patch<Payment>(`/payments/${id}/status`, { status });
      return response.data;
    }
  },

  getByTenant: async (tenantId: string) => {
    const response = await API.get<Payment[]>(`/payments/by-tenant/${tenantId}`);
    return response.data;
  },
};

// ============================================
// Invoices API
// ============================================

export const invoicesAPI = {
  list: async (params?: { leaseId?: string; status?: string }) => {
    const response = await API.get<Invoice[]>('/invoices', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: {
    leaseId: string;
    dueDate: string;
    items: { description: string; amount: number }[];
  }) => {
    const response = await API.post<Invoice>('/invoices', data);
    return response.data;
  },

  download: async (id: string) => {
    const response = await API.get(`/invoices/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================
// Disputes API
// ============================================

export const disputesAPI = {
  list: async () => {
    const response = await API.get<Dispute[]>('/disputes');
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<Dispute>(`/disputes/${id}`);
    return response.data;
  },

  create: async (data: {
    paymentId: string;
    reason: string;
    description: string;
  }) => {
    const response = await API.post<Dispute>('/disputes', data);
    return response.data;
  },

  resolve: async (id: string, data: { resolution: 'approved' | 'rejected'; notes?: string }) => {
    const response = await API.post<Dispute>(`/disputes/${id}/resolve`, data);
    return response.data;
  },
};

// ============================================
// Notifications API
// ============================================

export const notificationsAPI = {
  list: async (params?: { status?: 'read' | 'unread' }) => {
    const response = await API.get<Notification[]>('/notifications', { params });
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await API.post(`/notifications/${id}/mark-read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await API.post('/notifications/mark-all-read');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  },

  updatePreferences: async (preferences: Record<string, boolean>) => {
    const response = await API.patch('/notifications/preferences', preferences);
    return response.data;
  },
};

// ============================================
// Analytics API
// ============================================

export const analyticsAPI = {
  getDashboard: async () => {
    const response = await API.get<DashboardAnalytics>('/analytics/dashboard');
    return response.data;
  },
};

// ============================================
// Maintenance API (if available)
// ============================================

export const maintenanceAPI = {
  list: async (params?: { status?: string; unitId?: string }) => {
    const response = await API.get<any[]>('/maintenance', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get(`/maintenance/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await API.post('/maintenance', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await API.put(`/maintenance/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await API.patch(`/maintenance/${id}/status`, { status });
    return response.data;
  },
};

// ============================================
// Users API
// ============================================

export const usersAPI = {
  list: async (params?: { role?: string }) => {
    const response = await API.get<User[]>('/users', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await API.get<User>(`/users/${id}`);
    return response.data;
  },

  getMe: async () => {
    const response = await API.get<User>('/users/me');
    return response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await API.put<User>(`/users/${id}`, data);
    return response.data;
  },

  updateMe: async (data: Partial<User>) => {
    const response = await API.put<User>('/users/me', data);
    return response.data;
  },

  create: async (data: Partial<User> & { password: string }) => {
    const response = await API.post<User>('/users', data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  },
};

// ============================================
// Finance API
// ============================================

export const financeAPI = {
  getLeaseSummary: async (leaseId: string) => {
    const response = await API.get(`/finance/lease/${leaseId}/summary`);
    return response.data;
  },

  getLeaseSettlement: async (leaseId: string, params?: { terminationDate?: string; waivePenalty?: boolean }) => {
    const response = await API.get(`/finance/lease/${leaseId}/settlement`, { params });
    return response.data;
  },

  getOverview: async () => {
    const response = await API.get('/finance/overview');
    return response.data;
  },
};

// ============================================
// Health Check
// ============================================

export const healthAPI = {
  check: async () => {
    const response = await API.get<{ status: string; timestamp: string; uptime: number }>(
      '/health'
    );
    return response.data;
  },
};
