import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Enhanced configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  requestTimeoutMs: 4000, // Default 4 seconds timeout per request
  baseDelayMs: 500, // Start with 500ms delay between retries
  maxDelayMs: 2000, // Maximum delay between retries
};

// Circuit breaker configuration
const CIRCUIT_CONFIG = {
  maxFailures: 5,
  cooldownTimeMs: 10_000, // Stop requests for 10 seconds
  halfOpenMaxRequests: 3, // Allow 3 requests in half-open state
};

// Circuit breaker state
let circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
let failureCount = 0;
let lastFailureTime = 0;
let halfOpenRequestCount = 0;

// Network status
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let offlineQueue: Array<{ 
  request: InternalAxiosRequestConfig; 
  resolve: (value: AxiosResponse) => void; 
  reject: (reason: any) => void 
}> = [];

// Custom error classes
class ServerDownError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'ServerDownError';
  }
}

class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

class NetworkOfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkOfflineError';
  }
}

// Utility functions
const calculateDelay = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1),
    RETRY_CONFIG.maxDelayMs
  );
  return delay;
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Circuit breaker utilities
const shouldOpenCircuit = (): void => {
  if (failureCount >= CIRCUIT_CONFIG.maxFailures) {
    circuitState = 'OPEN';
    lastFailureTime = Date.now();
    console.warn(`🔴 Circuit breaker OPENED after ${failureCount} failures`);
  }
};

const canAttemptRequest = (): boolean => {
  const now = Date.now();
  
  switch (circuitState) {
    case 'CLOSED':
      return true;
      
    case 'OPEN':
      if (now - lastFailureTime > CIRCUIT_CONFIG.cooldownTimeMs) {
        circuitState = 'HALF_OPEN';
        halfOpenRequestCount = 0;
        console.info('🟡 Circuit breaker HALF-OPEN - testing server');
        return true;
      }
      return false;
      
    case 'HALF_OPEN':
      return halfOpenRequestCount < CIRCUIT_CONFIG.halfOpenMaxRequests;
      
    default:
      return true;
  }
};

const recordSuccess = (): void => {
  if (circuitState === 'HALF_OPEN') {
    circuitState = 'CLOSED';
    failureCount = 0;
    console.info('🟢 Circuit breaker CLOSED - server recovered');
  } else if (circuitState === 'CLOSED') {
    failureCount = Math.max(0, failureCount - 1); // Gradually decrease failure count on success
  }
};

const recordFailure = (): void => {
  failureCount++;
  
  if (circuitState === 'HALF_OPEN') {
    circuitState = 'OPEN';
    lastFailureTime = Date.now();
    console.warn('🔴 Circuit breaker RE-OPENED - server still failing');
  } else {
    shouldOpenCircuit();
  }
};

// Network status utilities
const processOfflineQueue = (): void => {
  console.info(`📡 Processing ${offlineQueue.length} queued requests...`);
  const queue = [...offlineQueue];
  offlineQueue = [];
  
  queue.forEach(({ request, resolve, reject }) => {
    api.request(request).then(resolve).catch(reject);
  });
};

// Check if error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  // Network errors, timeouts, etc.
  if (!error.response) {
    return true;
  }
  
  // Timeout errors are always retryable
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return true;
  }
  
  const status = error.response.status;
  // Retry on server errors (5xx) and some client errors
  return status >= 500 || status === 429 || status === 408;
};

// Create axios instance with dynamic timeout support
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: RETRY_CONFIG.requestTimeoutMs,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry metadata to request config
interface RetryConfig {
  retryCount?: number;
  retryDelay?: number;
  maxRetries?: number;
  timeout?: number;
  context?: string;
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retryConfig?: RetryConfig;
  }
}

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

// Network status event listeners (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    console.info('📡 Network back online - processing queued requests');
    processOfflineQueue();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    console.warn('📡 Network offline - queuing requests');
  });
}

// Request interceptor for circuit breaker, network status, and retry setup
api.interceptors.request.use(
  (config) => {
    // Check network status
    if (!isOnline) {
      return new Promise((resolve, reject) => {
        offlineQueue.push({ 
          request: config, 
          resolve: resolve as (value: AxiosResponse) => void, 
          reject 
        });
      });
    }

    // Check circuit breaker
    if (!canAttemptRequest()) {
      return Promise.reject(new CircuitOpenError(
        `Circuit breaker is OPEN. Requests blocked for ${Math.ceil((CIRCUIT_CONFIG.cooldownTimeMs - (Date.now() - lastFailureTime)) / 1000)}s`
      ));
    }

    // Setup retry metadata
    if (!config.retryConfig) {
      config.retryConfig = {
        retryCount: 0,
        maxRetries: RETRY_CONFIG.maxAttempts - 1,
        timeout: config.timeout || RETRY_CONFIG.requestTimeoutMs,
        context: config.url
      };
    }

    // Add auth token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Track half-open requests
    if (circuitState === 'HALF_OPEN') {
      halfOpenRequestCount++;
    }

    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url} (Attempt ${(config.retryConfig.retryCount || 0) + 1})`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for retry logic and circuit breaker management
api.interceptors.response.use(
  (response) => {
    // Record success for circuit breaker
    recordSuccess();
    
    if (response.config.retryConfig?.retryCount && response.config.retryConfig.retryCount > 0) {
      console.log(`✅ API Success after ${response.config.retryConfig.retryCount + 1} attempts: ${response.config.url}`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig;
    
    // Handle auth errors immediately
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Record failure for circuit breaker
    recordFailure();

    // Check if we should retry
    if (!config?.retryConfig) {
      return Promise.reject(error);
    }

    const { retryCount = 0, maxRetries = 0, context } = config.retryConfig;
    
    // Check if we can retry
    const canRetry = retryCount < maxRetries && isRetryableError(error) && canAttemptRequest();
    
    if (!canRetry) {
      if (retryCount >= maxRetries) {
        console.error(`❌ API Failed after ${maxRetries + 1} attempts: ${context}`);
        return Promise.reject(new ServerDownError(
          `Server appears to be down. Failed after ${maxRetries + 1} attempts (each with ${config.retryConfig.timeout}ms timeout)`,
          error
        ));
      }
      return Promise.reject(error);
    }

    // Calculate retry delay
    const delay = calculateDelay(retryCount + 1);
    
    console.log(`🔄 Retrying ${context} in ${delay}ms... (${maxRetries - retryCount} attempts remaining)`);
    
    // Update retry config
    config.retryConfig.retryCount = retryCount + 1;
    
    // Wait and retry
    await sleep(delay);
    return api.request(config);
  }
);

// API methods with automatic retry via interceptors and dynamic timeout support
export const authAPI = {
  login: async (email: string, password: string, timeout?: number) => {
    const response = await api.post('/auth/login', { email, password }, { timeout });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },
  
  getProfile: async (timeout?: number) => {
    const response = await api.get('/auth/me', { timeout });
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string, timeout?: number) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    }, { timeout });
    return response.data;
  },
  
  logout: async (timeout?: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout
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
  getAll: async (params?: any, timeout?: number) => {
    const response = await api.get('/bills', { params, timeout });
    return response.data;
  },
  
  getById: async (id: string, timeout?: number) => {
    const response = await api.get(`/bills/${id}`, { timeout });
    return response.data;
  },
  
  create: async (billData: any, timeout?: number) => {
    // Bill creation might take longer, so default to 8 seconds if not specified
    const actualTimeout = timeout || 8000;
    const response = await api.post('/bills', billData, { timeout: actualTimeout });
    return response.data;
  },
  
  update: async (id: string, billData: any, timeout?: number) => {
    const response = await api.put(`/bills/${id}`, billData, { timeout });
    return response.data;
  },
  
  updatePaymentStatus: async (id: string, paymentStatus: string, paymentMethod: string, timeout?: number) => {
    const response = await api.put(`/bills/${id}/payment-status`, {
      paymentStatus,
      paymentMethod,
    }, { timeout });
    return response.data;
  },
  
  delete: async (id: string, timeout?: number) => {
    const response = await api.delete(`/bills/${id}`, { timeout });
    return response.data;
  },
};

export const customersAPI = {
  getAll: async (params?: any, timeout?: number) => {
    const response = await api.get('/customers', { params, timeout });
    return response.data;
  },
  
  getById: async (id: string, timeout?: number) => {
    const response = await api.get(`/customers/${id}`, { timeout });
    return response.data;
  },
  
  create: async (customerData: any, timeout?: number) => {
    const response = await api.post('/customers', customerData, { timeout });
    return response.data;
  },
  
  update: async (id: string, customerData: any, timeout?: number) => {
    const response = await api.put(`/customers/${id}`, customerData, { timeout });
    return response.data;
  },
  
  delete: async (id: string, timeout?: number) => {
    const response = await api.delete(`/customers/${id}`, { timeout });
    return response.data;
  },
  
  search: async (query: string, timeout?: number) => {
    const response = await api.get(`/customers/search/${query}`, { timeout });
    return response.data;
  },
};

export const analyticsAPI = {
  getDashboard: async (timeout?: number) => {
    const response = await api.get('/analytics/dashboard', { timeout });
    return response.data;
  },
  
  getSalesReport: async (params?: any, timeout?: number) => {
    // Reports might take longer, so default to 10 seconds if not specified
    const actualTimeout = timeout || 10000;
    const response = await api.get('/analytics/sales-report', { params, timeout: actualTimeout });
    return response.data;
  },
  
  getTaxReport: async (params?: any, timeout?: number) => {
    // Reports might take longer, so default to 10 seconds if not specified
    const actualTimeout = timeout || 10000;
    const response = await api.get('/analytics/tax-report', { params, timeout: actualTimeout });
    return response.data;
  },
};

// Utility function for custom API calls with specific timeout
export const createApiCall = (timeout?: number) => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: timeout || RETRY_CONFIG.requestTimeoutMs,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Export utilities for advanced usage
export { 
  ServerDownError, 
  CircuitOpenError, 
  NetworkOfflineError,
  RETRY_CONFIG,
  CIRCUIT_CONFIG
};

// Export circuit breaker status for monitoring
export const getCircuitBreakerStatus = () => ({
  state: circuitState,
  failureCount,
  lastFailureTime,
  isOnline,
  queuedRequests: offlineQueue.length
});

// Export function to manually reset circuit breaker (for admin use)
export const resetCircuitBreaker = () => {
  circuitState = 'CLOSED';
  failureCount = 0;
  lastFailureTime = 0;
  halfOpenRequestCount = 0;
  console.info('🔄 Circuit breaker manually reset');
};

export default api;