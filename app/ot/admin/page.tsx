// export const dynamic = 'force-dynamic';

// import React from 'react';
// import AdminPageClient from './AdminPageClient';

// export default function AdminPage() {
//   return <AdminPageClient />;
// }



"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/context/TenantContext';
import { MODULE_KEYS, ADMIN_FEATURES } from '@/lib/feature';
import AdminPageClient from './AdminPageClient';

export default function AdminPage() {
  const router = useRouter();
  const { 
    tenant, 
    isMicroFeatureEnabled, 
    isLoading: tenantLoading
  } = useTenant();

  // Check if Admin Dashboard feature is enabled
  const isAdminEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.ADMIN,
    ADMIN_FEATURES.DASHBOARD
  );

  // Loading state
  if (tenantLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-500">Loading tenant configuration...</p>
        </div>
      </div>
    );
  }

  // Access Denied
  if (!isAdminEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Admin Dashboard feature is not enabled for {tenant?.name || 'this tenant'}.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Feature enabled – render the client component
  return <AdminPageClient />;
}