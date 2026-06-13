// Demo mode utilities - provides mock data when no backend is available

export const DEMO_USER = {
  id: 'demo-admin-001',
  _id: 'demo-admin-001',
  email: 'admin@demo.rms.com',
  fullName: 'Demo Admin',
  role: 'ADMIN' as const,
  phone: '+251911000000',
  twoFactorEnabled: false,
};

export function isDemoMode(): boolean {
  return localStorage.getItem('demoMode') === 'true';
}

export function enableDemoMode() {
  localStorage.setItem('demoMode', 'true');
  localStorage.setItem('token', 'demo-token');
  localStorage.setItem('user', JSON.stringify(DEMO_USER));
}

export function disableDemoMode() {
  localStorage.removeItem('demoMode');
}

// Mock data generators
const mockTenants = [
  { _id: 't1', fullName: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251911111111', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-06-15T10:00:00Z' },
  { _id: 't2', fullName: 'Sara Mengistu', email: 'sara@example.com', phone: '+251922222222', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-07-01T10:00:00Z' },
  { _id: 't3', fullName: 'Daniel Worku', email: 'daniel@example.com', phone: '+251933333333', status: 'SUSPENDED', role: 'TENANT', createdAt: '2025-05-20T10:00:00Z' },
  { _id: 't4', fullName: 'Helen Tadesse', email: 'helen@example.com', phone: '+251944444444', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-08-10T10:00:00Z' },
  { _id: 't5', fullName: 'Yonas Alemu', email: 'yonas@example.com', phone: '+251955555555', status: 'INVITED', role: 'TENANT', createdAt: '2025-09-01T10:00:00Z' },
  { _id: 't6', fullName: 'Meron Hailu', email: 'meron@example.com', phone: '+251966666666', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-04-12T10:00:00Z' },
  { _id: 't7', fullName: 'Dawit Getachew', email: 'dawit@example.com', phone: '+251977777777', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-03-05T10:00:00Z' },
  { _id: 't8', fullName: 'Tigist Bekele', email: 'tigist@example.com', phone: '+251988888888', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-01-20T10:00:00Z' },
  { _id: 't9', fullName: 'Solomon Girma', email: 'solomon@example.com', phone: '+251999999999', status: 'SUSPENDED', role: 'TENANT', createdAt: '2025-02-14T10:00:00Z' },
  { _id: 't10', fullName: 'Bethlehem Assefa', email: 'beth@example.com', phone: '+251900000000', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-10-01T10:00:00Z' },
  { _id: 't11', fullName: 'Henok Tesfaye', email: 'henok@example.com', phone: '+251901111111', status: 'ACTIVE', role: 'TENANT', createdAt: '2025-11-15T10:00:00Z' },
  { _id: 't12', fullName: 'Rahel Mulugeta', email: 'rahel@example.com', phone: '+251902222222', status: 'INVITED', role: 'TENANT', createdAt: '2025-12-01T10:00:00Z' },
];

const mockProperties = [
  { _id: 'p1', name: 'Bole Apartments', address: 'Bole Road, Addis Ababa', city: 'Addis Ababa', totalUnits: 24, occupiedUnits: 20 },
  { _id: 'p2', name: 'Sarbet Residences', address: 'Sarbet, Addis Ababa', city: 'Addis Ababa', totalUnits: 16, occupiedUnits: 12 },
  { _id: 'p3', name: 'CMC Commercial', address: 'CMC Area, Addis Ababa', city: 'Addis Ababa', totalUnits: 8, occupiedUnits: 7 },
  { _id: 'p4', name: 'Kazanchis Tower', address: 'Kazanchis, Addis Ababa', city: 'Addis Ababa', totalUnits: 32, occupiedUnits: 28 },
];

const mockUnits = [
  { _id: 'u1', propertyId: 'p1', unitNumber: '101', type: 'studio', bedrooms: 1, bathrooms: 1, rentAmount: 8000, status: 'occupied' },
  { _id: 'u2', propertyId: 'p1', unitNumber: '102', type: '1-bedroom', bedrooms: 1, bathrooms: 1, rentAmount: 12000, status: 'available' },
  { _id: 'u3', propertyId: 'p1', unitNumber: '201', type: '2-bedroom', bedrooms: 2, bathrooms: 1, rentAmount: 18000, status: 'occupied' },
  { _id: 'u4', propertyId: 'p2', unitNumber: 'A1', type: '3-bedroom', bedrooms: 3, bathrooms: 2, rentAmount: 25000, status: 'occupied' },
  { _id: 'u5', propertyId: 'p2', unitNumber: 'A2', type: 'studio', bedrooms: 1, bathrooms: 1, rentAmount: 7500, status: 'maintenance' },
];

const mockLeases = [
  { _id: 'l1', tenantId: mockTenants[0], unitId: mockUnits[0], startDate: '2025-01-01', endDate: '2026-01-01', rentAmount: 8000, depositAmount: 16000, status: 'ACTIVE' },
  { _id: 'l2', tenantId: mockTenants[1], unitId: mockUnits[2], startDate: '2025-03-01', endDate: '2026-03-01', rentAmount: 18000, depositAmount: 36000, status: 'ACTIVE' },
  { _id: 'l3', tenantId: mockTenants[3], unitId: mockUnits[3], startDate: '2024-06-01', endDate: '2025-06-01', rentAmount: 25000, depositAmount: 50000, status: 'EXPIRED' },
];

const mockPayments = [
  { _id: 'pay1', leaseId: 'l1', amount: 8000, paymentMethod: 'bank_transfer', referenceNumber: 'TXN001', status: 'verified', transactionDate: '2025-12-01T10:00:00Z' },
  { _id: 'pay2', leaseId: 'l1', amount: 8000, paymentMethod: 'mobile_money', referenceNumber: 'TXN002', status: 'pending', transactionDate: '2026-01-03T10:00:00Z' },
  { _id: 'pay3', leaseId: 'l2', amount: 18000, paymentMethod: 'bank_transfer', referenceNumber: 'TXN003', status: 'verified', transactionDate: '2025-12-05T10:00:00Z' },
  { _id: 'pay4', leaseId: 'l2', amount: 18000, paymentMethod: 'cash', status: 'rejected', transactionDate: '2026-01-10T10:00:00Z' },
];

const mockInvoices = [
  { _id: 'inv1', leaseId: 'l1', dueDate: '2026-02-01', items: [{ description: 'Monthly Rent - Feb 2026', amount: 8000 }], totalAmount: 8000, status: 'pending' },
  { _id: 'inv2', leaseId: 'l2', dueDate: '2026-02-01', items: [{ description: 'Monthly Rent - Feb 2026', amount: 18000 }], totalAmount: 18000, status: 'pending' },
  { _id: 'inv3', leaseId: 'l1', dueDate: '2026-01-01', items: [{ description: 'Monthly Rent - Jan 2026', amount: 8000 }], totalAmount: 8000, status: 'paid' },
];

const mockDisputes = [
  { _id: 'd1', paymentId: 'pay4', reason: 'payment_already_made', description: 'I paid in cash at the office but it shows rejected', status: 'open' },
];

const mockNotifications = [
  { _id: 'n1', title: 'Payment Received', message: 'Payment of ETB 8,000 verified for unit 101', type: 'payment', status: 'unread', createdAt: '2026-02-09T14:00:00Z' },
  { _id: 'n2', title: 'Lease Expiring', message: 'Lease for unit A1 expires in 30 days', type: 'lease', status: 'unread', createdAt: '2026-02-08T10:00:00Z' },
  { _id: 'n3', title: 'Maintenance Request', message: 'New maintenance request for unit A2', type: 'maintenance', status: 'read', createdAt: '2026-02-07T09:00:00Z' },
];

const mockAnalytics = {
  totalProperties: 4,
  totalUnits: 80,
  occupancyRate: 84,
  pendingPayments: 8,
  totalCollected: 425000,
  averagePaymentDays: 3,
};

const mockMaintenance = [
  { _id: 'm1', unitId: 'u5', tenantId: 't1', title: 'Leaking faucet', description: 'Kitchen faucet is leaking', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2026-02-05T10:00:00Z' },
  { _id: 'm2', unitId: 'u1', tenantId: 't1', title: 'Broken window', description: 'Living room window cracked', status: 'OPEN', priority: 'HIGH', createdAt: '2026-02-09T08:00:00Z' },
];

// Route matcher for mock API responses
type MockHandler = (url: string, params?: any) => any;

const mockRoutes: Record<string, MockHandler> = {
  'GET /users': (_url, params) => {
    let data = params?.role === 'TENANT' ? mockTenants : [...mockTenants, DEMO_USER];
    if (params?.status && params.status !== 'ALL') {
      data = data.filter((t: any) => t.status === params.status);
    }
    return data;
  },
  'GET /users/me': () => DEMO_USER,
  'GET /properties': () => ({ data: mockProperties, pagination: { page: 1, limit: 10, total: mockProperties.length, pages: 1 } }),
  'GET /units': () => mockUnits,
  'GET /leases': () => mockLeases,
  'GET /payments': () => mockPayments,
  'GET /invoices': () => mockInvoices,
  'GET /disputes': () => mockDisputes,
  'GET /notifications': () => mockNotifications,
  'GET /analytics/dashboard': () => mockAnalytics,
  'GET /maintenance': () => mockMaintenance,
  'POST /auth/logout': () => ({ success: true }),
};

// Match a URL pattern like /properties/p1
function matchRoute(method: string, url: string): any {
  const cleanUrl = url.replace(/^\/api/, '');
  
  // Exact match first
  const exactKey = `${method} ${cleanUrl}`;
  if (mockRoutes[exactKey]) return mockRoutes[exactKey];

  // Match detail routes like /properties/:id
  const segments = cleanUrl.split('/').filter(Boolean);
  if (segments.length === 2) {
    const collection = segments[0];
    const id = segments[1];
    
    const collectionMap: Record<string, any[]> = {
      properties: mockProperties,
      units: mockUnits,
      leases: mockLeases,
      payments: mockPayments,
      invoices: mockInvoices,
      disputes: mockDisputes,
      users: [...mockTenants, DEMO_USER],
      maintenance: mockMaintenance,
      notifications: mockNotifications,
    };

    const items = collectionMap[collection];
    if (items) {
      return () => items.find((item: any) => item._id === id || item.id === id) || items[0];
    }
  }

  return null;
}

// Intercept axios requests when in demo mode
export function createDemoInterceptor(axiosInstance: any) {
  axiosInstance.interceptors.request.use((config: any) => {
    if (!isDemoMode()) return config;

    const method = (config.method || 'get').toUpperCase();
    const url = config.url || '';
    
    const handler = matchRoute(method, url);
    
    if (handler) {
      // Cancel the real request and return mock data
      const mockData = handler(url, config.params);
      return Promise.reject({
        __DEMO_MOCK__: true,
        data: mockData,
        config,
      });
    }

    // For POST/PUT/DELETE without specific handler, return success
    if (method !== 'GET') {
      return Promise.reject({
        __DEMO_MOCK__: true,
        data: { success: true, message: 'Demo: Operation completed' },
        config,
      });
    }

    return config;
  });

  axiosInstance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error?.__DEMO_MOCK__) {
        return Promise.resolve({ data: error.data, status: 200, config: error.config });
      }
      return Promise.reject(error);
    }
  );
}
