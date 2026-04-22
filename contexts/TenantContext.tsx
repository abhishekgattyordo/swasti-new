'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types based on your API response
interface MicroFeatures {
  [key: string]: boolean;
}

interface ModuleConfig {
  enabled: boolean;
  microFeatures: MicroFeatures;
}

interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  databaseUrl: string;
  schemaName: string | null;
  isActive: boolean;
}

interface TenantData {
  host: string;
  tenant: TenantConfig;
  enabledFeatures: string[];
  configByKey: Record<string, ModuleConfig>;
}

interface TenantContextType {
  tenant: TenantConfig | null;
  host: string | null;
  enabledFeatures: string[];
  configByKey: Record<string, ModuleConfig>;
  isLoading: boolean;
  error: string | null;
  isFeatureEnabled: (feature: string) => boolean;
  isMicroFeatureEnabled: (module: string, microFeature: string) => boolean;
  getModuleConfig: (module: string) => ModuleConfig | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Helper to get default tenant config
const getDefaultTenantConfig = (): TenantData => {
  // Get hostname for default config
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  return {
    host: hostname,
    tenant: {
      id: 'default',
      slug: 'default',
      name: 'Default Hospital',
      databaseUrl: process.env.NEXT_PUBLIC_DEFAULT_DATABASE_URL || '',
      schemaName: null,
      isActive: true,
    },
    enabledFeatures: [],
    configByKey: {},
  };
};

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant configuration from API with caching
  const fetchTenantConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
      
      // Use host-specific cache key to prevent mixing data across domains
      const host = typeof window !== 'undefined' ? window.location.host : 'unknown';
      const CACHE_KEY = `tenant_config_${host}`;
      const CACHE_TIME_KEY = `tenant_config_time_${host}`;

      // ✅ STEP 1: Check localStorage cache
      if (typeof window !== 'undefined') {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

        if (cachedData && cachedTime) {
          const isValid = Date.now() - Number(cachedTime) < CACHE_TTL;

          if (isValid) {
            console.log(`⚡ Using cached tenant config for ${host}`);
            setTenantData(JSON.parse(cachedData));
            setIsLoading(false);
            return;
          } else {
            console.log(`⚠️ Cache expired for ${host}, fetching fresh data...`);
          }
        }
      }

      // ❌ STEP 2: Fetch only if cache not available or expired
      console.log(`🌐 Fetching tenant config from API for ${host}...`);
      const response = await fetch('/api/tenant/config');
      
      // Handle 404 - No tenant config found, use default
      if (response.status === 404) {
        console.warn('⚠️ No tenant config found (404), using default configuration');
        const defaultData = getDefaultTenantConfig();
        setTenantData(defaultData);
        
        // Cache default config too
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(defaultData));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }
        return;
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate response has tenant data
      if (!data.tenant) {
        console.warn('⚠️ Invalid tenant config response, using default');
        const defaultData = getDefaultTenantConfig();
        setTenantData(defaultData);
        
        // Cache default config
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(defaultData));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        }
        return;
      }
      
      // ✅ STEP 3: Save to localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        console.log(`💾 Tenant config cached for ${host} (TTL: ${CACHE_TTL / 1000}s)`);
      }
      
      setTenantData(data);
    } catch (err) {
      console.error('❌ Failed to fetch tenant config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Try to use expired cache as fallback if available
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const CACHE_KEY = `tenant_config_${host}`;
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          console.warn('⚠️ Using expired cache as fallback');
          setTenantData(JSON.parse(cachedData));
        } else {
          // Fallback to default config
          console.warn('⚠️ Falling back to default tenant configuration');
          setTenantData(getDefaultTenantConfig());
        }
      } else {
        setTenantData(getDefaultTenantConfig());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load tenant config on mount
  useEffect(() => {
    fetchTenantConfig();
  }, []);

  // Check if a main feature is enabled
  const isFeatureEnabled = (feature: string): boolean => {
    if (!tenantData) return false;
    return tenantData.enabledFeatures.includes(feature);
  };

  // Check if a micro-feature is enabled
  const isMicroFeatureEnabled = (module: string, microFeature: string): boolean => {
    if (!tenantData) return false;
    
    const moduleConfig = tenantData.configByKey[module];
    if (!moduleConfig || !moduleConfig.enabled) return false;
    
    return moduleConfig.microFeatures[microFeature] === true;
  };

  // Get entire module configuration
  const getModuleConfig = (module: string): ModuleConfig | null => {
    if (!tenantData) return null;
    return tenantData.configByKey[module] || null;
  };

  // Refresh tenant data (bypass cache)
  const refreshTenant = async () => {
    // Clear cache for this host before refreshing
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const CACHE_KEY = `tenant_config_${host}`;
      const CACHE_TIME_KEY = `tenant_config_time_${host}`;
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      console.log(`🗑️ Cache cleared for ${host}`);
    }
    await fetchTenantConfig();
  };

  return (
    <TenantContext.Provider
      value={{
        tenant: tenantData?.tenant || null,
        host: tenantData?.host || null,
        enabledFeatures: tenantData?.enabledFeatures || [],
        configByKey: tenantData?.configByKey || {},
        isLoading,
        error,
        isFeatureEnabled,
        isMicroFeatureEnabled,
        getModuleConfig,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

// Custom hook to use tenant context
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}