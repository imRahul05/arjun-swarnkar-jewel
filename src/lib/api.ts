import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = () => {
  return localStorage.getItem('authToken');
};

const setToken = (token: string) => {
  localStorage.setItem('authToken', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeToken = () => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
};

// Set token from localStorage on app start
const token = getToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  
  // logout: () => {
  //   removeToken();
  // },
  logout: async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    await api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Remove token locally
    removeToken();
  } catch (err) {
    console.error('Logout failed', err);
    removeToken();
  }
},

};

export const billsAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/bills', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },
  
  create: async (billData: any) => {
    const response = await api.post('/bills', billData);
    return response.data;
  },
  
  update: async (id: string, billData: any) => {
    const response = await api.put(`/bills/${id}`, billData);
    return response.data;
  },
  
  updatePaymentStatus: async (id: string, paymentStatus: string, paymentMethod: string) => {
    const response = await api.put(`/bills/${id}/payment-status`, {
      paymentStatus,
      paymentMethod,
    });
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};

export const customersAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  
  search: async (query: string) => {
    const response = await api.get(`/customers/search/${query}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
  
  getSalesReport: async (params?: any) => {
    const response = await api.get('/analytics/sales-report', { params });
    return response.data;
  },
  
  getTaxReport: async (params?: any) => {
    const response = await api.get('/analytics/tax-report', { params });
    return response.data;
  },
};

export default api;