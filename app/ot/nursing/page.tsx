// export const dynamic = 'force-dynamic';

// import React from 'react';
// import NursingPageClient from './NursingPageClient';

// export default function NursingPage() {
//   return <NursingPageClient />;
// }



"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/context/TenantContext';
import { MODULE_KEYS, OT_FEATURES } from '@/lib/feature';
import NursingPageClient from './NursingPageClient';

export default function NursingPage() {
  const router = useRouter();
  const { 
    tenant, 
    isMicroFeatureEnabled, 
    isLoading: tenantLoading
  } = useTenant();

  // Check if OT Nursing feature is enabled
  const isNursingEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.OT,
    OT_FEATURES.NURSING
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
  if (!isNursingEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Nursing Staff feature is not enabled for {tenant?.name || 'this tenant'}.
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
  return <NursingPageClient />;
}