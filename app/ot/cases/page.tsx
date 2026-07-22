// export const dynamic = 'force-dynamic';

// import React from 'react';
// import CasesDirectory from '@/components/ot/CasesDirectory';
// import { ClipboardList } from 'lucide-react';


// export default function CasesPage() {
//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
//             <ClipboardList className="w-7 h-7 text-teal-600" />
//             Surgical Cases Directory
//           </h1>
//           <p className="text-sm text-slate-500 mt-1">Review, monitor, and advance live patient procedures across the 17-step clinical pipeline.</p>
//         </div>
//       </div>

//       <CasesDirectory />
//     </div>
//   );
// }



"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CasesDirectory from '@/components/ot/CasesDirectory';
import { ClipboardList } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { MODULE_KEYS, OT_FEATURES } from '@/lib/feature';

export default function CasesPage() {
  const router = useRouter();
  const { 
    tenant, 
    isMicroFeatureEnabled, 
    isLoading: tenantLoading,
    configByKey,   // ✅ Comma added
    refreshTenant
  } = useTenant();



  // Check if OT Cases feature is enabled
  const isCasesEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.OT,
    OT_FEATURES.CASES
  );

  // Debug logs (optional)
  useEffect(() => {
    console.log('🔍 tenant:', tenant);
    console.log('🔍 configByKey.ot:', configByKey?.ot);
    console.log('🔍 isCasesEnabled:', isCasesEnabled);
  }, [tenant, configByKey, isCasesEnabled]);

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
  if (!isCasesEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Surgical Cases feature is not enabled for {tenant?.name || 'this tenant'}.
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-teal-600" />
            Surgical Cases Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, monitor, and advance live patient procedures across the 17-step clinical pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {tenant?.name || 'Tenant'}
          </span>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
            ✓ Enabled
          </span>
        </div>
      </div>

      <CasesDirectory />
    </div>
  );
}