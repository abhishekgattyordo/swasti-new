'use client';

import { useTenant } from '@/contexts/TenantContext';
import { ReactNode } from 'react';

interface FeatureGuardProps {
  feature: string;
  microFeature?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function FeatureGuard({ feature, microFeature, fallback, children }: FeatureGuardProps) {
  const { isFeatureEnabled, isMicroFeatureEnabled } = useTenant();
  
  let hasAccess = false;
  
  if (microFeature) {
    hasAccess = isMicroFeatureEnabled(feature, microFeature);
  } else {
    hasAccess = isFeatureEnabled(feature);
  }
  
  if (!hasAccess) {
    return <>{fallback || null}</>;
  }
  
  return <>{children}</>;
}