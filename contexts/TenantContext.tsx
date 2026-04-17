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

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant configuration from API
  const fetchTenantConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/tenant/config');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tenant config: ${response.status}`);
      }
      
      const data = await response.json();
      setTenantData(data);
    } catch (err) {
      console.error('Failed to fetch tenant config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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

  // Refresh tenant data
  const refreshTenant = async () => {
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