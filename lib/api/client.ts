import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Declare window property for tenant cache
declare global {
  interface Window {
    __TENANT_CONFIG_CACHE__?: {
      data: unknown;
      timestamp: number;
      host: string;
    };
  }
}

// Get tenant ID from localStorage (where TenantContext stores it)
const getTenantIdFromCache = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const host = window.location.host;
  const CACHE_KEY = `tenant_config_${host}`;
  
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const slug = parsed?.tenant?.slug;
      if (slug) {
        console.log(`⚡ Tenant from localStorage cache: ${slug}`);
        return slug;
      }
    }
  } catch (e) {
    console.error('Error reading tenant from cache:', e);
  }
  
  return null;
};

// Wait for tenant to be available (with retry)
const waitForTenant = (maxAttempts = 20, delay = 100): Promise<string> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const check = () => {
      const tenantId = getTenantIdFromCache();
      
      if (tenantId) {
        resolve(tenantId);
      } else if (attempts >= maxAttempts) {
        reject(new Error('Tenant not available. Please refresh the page.'));
      } else {
        attempts++;
        setTimeout(check, delay);
      }
    };
    
    check();
  });
};

// Singleton promise to prevent multiple waits
let tenantPromise: Promise<string> | null = null;

const apiClient = axios.create({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - adds token and tenant ID to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Wait for tenant to be available (only once)
      if (!tenantPromise) {
        tenantPromise = waitForTenant();
      }
      
      const tenantId = await tenantPromise;
      config.headers['X-Tenant-ID'] = tenantId;
      console.log(`🏥 Tenant ID: ${tenantId} - ${config.url || 'URL not available'}`);
      
      // For web: use localStorage for token
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (error) {
      console.error('❌ Tenant detection error:', error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    console.log('❌ API Error:', error?.response?.data || error.message);
    
    // Handle 401 Unauthorized - token expired
    if (error?.response?.status === 401 && !originalRequest?._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      
      try {
        const response = await apiClient.post('/api/auth/refresh', {});
        const { accessToken } = response as { accessToken?: string };
        if (!accessToken) {
          throw new Error('Refresh response missing accessToken');
        }
        
        localStorage.setItem('accessToken', accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          const tenantId = getTenantIdFromCache();
          if (tenantId) {
            originalRequest.headers['X-Tenant-ID'] = tenantId;
          }
        }
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error?.response?.status === 403 && typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);

// Optional: Pre-fetch tenant on page load (doesn't call API, just checks cache)
if (typeof window !== 'undefined') {
  // Just check if tenant is already in cache, don't fetch
  const existingTenant = getTenantIdFromCache();
  if (existingTenant) {
    console.log(`✅ Tenant already cached: ${existingTenant}`);
    tenantPromise = Promise.resolve(existingTenant);
  }
}

export default apiClient;