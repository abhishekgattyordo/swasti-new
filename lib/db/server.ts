import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// ✅ Get tenant ID STRICT (no fallback)
const getTenantId = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new Error('Tenant detection not available on server');
  }

  const hostname = window.location.hostname;
  const cleanHostname = hostname.split(':')[0];
  const parts = cleanHostname.split('.');

  console.log(`🌐 Hostname: ${cleanHostname}`);
  console.log(`📡 Parts:`, parts);

  // Case 1: subdomain (tenant.localhost)
  if (parts.length >= 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  // Case 2: production subdomain (tenant.domain.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  // Case 3: root domain → MUST resolve via API
  const response = await fetch('/api/tenant/config', {
    headers: {
      'host': cleanHostname, // ✅ IMPORTANT FIX
    },
  });

  if (!response.ok) {
    throw new Error(`Tenant config API failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data?.tenant?.slug) {
    throw new Error(`No tenant mapped for domain: ${cleanHostname}`);
  }

  return data.tenant.slug;
};

const apiClient = axios.create({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Request Interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tenantId = await getTenantId();

    if (!tenantId) {
      throw new Error('Tenant ID missing');
    }

    config.headers['X-Tenant-ID'] = tenantId;

    console.log(`🏥 Tenant: ${tenantId} → ${config.url}`);

    // Token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Response Interceptor
apiClient.interceptors.response.use(
  (res) => res.data,
  async (error: AxiosError) => {
    console.error('❌ API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;