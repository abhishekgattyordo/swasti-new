// import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';


// declare module 'axios' {
//   export interface InternalAxiosRequestConfig {
//     _retry?: boolean;
//   }
// }


// const apiClient = axios.create({
//   baseURL: typeof window !== "undefined"
//     ? window.location.origin
//     : process.env.NEXT_PUBLIC_API_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Request interceptor - adds token to requests
// apiClient.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     // For web: use localStorage
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//         console.log('🔑 Adding token to headers:', token.substring(0, 20) + '...');
//       }
//     }
//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error)
// );

// // Response interceptor
// apiClient.interceptors.response.use(
//   (response) => response.data,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
//     console.log('❌ API Error:', error?.response?.data || error.message);
    
//     // Handle 401 Unauthorized - token expired
//     if (error?.response?.status === 401 && !originalRequest?._retry && typeof window !== 'undefined') {
//       originalRequest._retry = true;
      
//       try {
//         // Try to refresh token
//         const refreshToken = localStorage.getItem('refreshToken');
//         if (refreshToken) {
//           const response = await apiClient.post('/auth/refresh/', { refresh: refreshToken });
//           const { access } = response as any;
          
//           localStorage.setItem('accessToken', access);
          
//           // Retry original request with new token
//           if (originalRequest.headers) {
//             originalRequest.headers.Authorization = `Bearer ${access}`;
//           }
//           return apiClient(originalRequest);
//         }
//       } catch (refreshError) {
//         // Refresh failed - logout
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }
    
//     // Handle 403 Forbidden
//     if (error?.response?.status === 403 && typeof window !== 'undefined') {
//       window.location.href = '/unauthorized';
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default apiClient ;


import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Helper function to get tenant ID from domain
const getTenantId = (): string => {
  if (typeof window === 'undefined') return 'kmc';
  
  const hostname = window.location.hostname;
  
  // Map domain to tenant ID
  const tenantMap: Record<string, string> = {
    'localhost': 'kmc',
    '127.0.0.1': 'kmc',
    'his-app.com': 'kmc',
    'his-apollo.com': 'manipal',
    'apollo.his.com': 'apollo',
    'fortis.his.com': 'fortis',
  };
  
  // Extract subdomain for multi-tenant domains
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (tenantMap[subdomain]) {
      return tenantMap[subdomain];
    }
  }
  
  return tenantMap[hostname] || 'kmc';
};

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
    // Add Tenant ID header
    const tenantId = getTenantId();
    config.headers['X-Tenant-ID'] = tenantId;
    console.log(`🏥 Tenant ID: ${tenantId} - ${config.url}`);
    
    // For web: use localStorage for token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Adding token to headers:', token.substring(0, 20) + '...');
      }
    }
    return config;
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
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh/', { refresh: refreshToken });
          const { access } = response as any;
          
          localStorage.setItem('accessToken', access);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
            // Keep tenant ID
            originalRequest.headers['X-Tenant-ID'] = getTenantId();
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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

export default apiClient;