// "use client";

// import React, { useState, useEffect } from 'react';
// import { CasesProvider } from '@/context/CasesContext';
// import { Menu, Activity } from 'lucide-react';
// import Sidebar from './Sidebar';

// export default function ClientLayoutWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   // Ensure component is mounted before rendering sidebar
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   return (
//     <CasesProvider>
//       <div id="swasti-app-container" className="flex flex-col lg:flex-row bg-slate-50 min-h-screen text-slate-800 font-sans">
//         {/* Mobile Top Bar */}
//         <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#F4F9F7] border-b border-[#E2EFEA] sticky top-0 z-30">
//           <div className="flex items-center gap-2">
//             <button 
//               onClick={() => setIsSidebarOpen(true)}
//               className="p-1.5 text-[#4A6B66] hover:text-[#2BB2A7] hover:bg-[#EAF7F4] rounded-lg transition-colors cursor-pointer"
//               title="Open menu"
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] rounded-lg flex items-center justify-center">
//                 <Activity className="w-4.5 h-4.5 text-white" />
//               </div>
//               <span className="font-bold text-sm text-[#1A1A1A]">SWASTI AI</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-1.5 bg-[#EAF7F4]/80 px-2 py-0.5 rounded-lg border border-[#E2EFEA]">
//             <span className="relative flex h-1.5 w-1.5">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2BB2A7] opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2BB2A7]"></span>
//             </span>
//             <span className="text-[10px] font-bold text-[#1F8F89] font-mono">HIS OK</span>
//           </div>
//         </header>

//         {/* Sidebar with props - only render on client side */}
//         {isMounted && (
//           <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//         )}
        
//         {/* Main content */}
//         <main className="flex-1 overflow-y-auto lg:h-screen p-4 md:p-8">
//           {children}
//         </main>
//       </div>
//     </CasesProvider>
//   );
// }




// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { CasesProvider, useCases } from '@/context/CasesContext';
// import Sidebar from './Sidebar';
// import { Menu, Activity, Bell, Database, X, ChevronRight, CheckSquare, Sparkles } from 'lucide-react';

// function ClientLayoutContent({ children }: { children: React.ReactNode }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const { cases, loading } = useCases();

//   const [activeNotification, setActiveNotification] = useState<{
//     id: string;
//     patientName: string;
//     surgeryName: string;
//     recommendedBy: string;
//     priority: string;
//   } | null>(null);

//   const prevCasesLength = useRef<number | null>(null);
//   const isInitialLoad = useRef(true);

//   useEffect(() => {
//     if (loading) return;

//     if (isInitialLoad.current) {
//       prevCasesLength.current = cases.length;
//       isInitialLoad.current = false;
//       return;
//     }

//     if (prevCasesLength.current !== null && cases.length > prevCasesLength.current) {
//       // Find newly recommended cases by checking if there's a case that has status 'Recommended'
//       // and whose ID was not in a previously known set (or just select the newest recommended one)
//       const recommendedCases = cases.filter(c => c.status === 'Recommended');
//       if (recommendedCases.length > 0) {
//         // Take the latest recommended one
//         const newestCase = recommendedCases[0];
        
//         // Only trigger if we aren't already displaying it
//         if (!activeNotification || activeNotification.id !== newestCase.id) {
//           setActiveNotification({
//             id: newestCase.id,
//             patientName: newestCase.patient.name,
//             surgeryName: newestCase.recommendation.surgeryName,
//             recommendedBy: newestCase.recommendation.recommendedBy,
//             priority: newestCase.recommendation.priorityLevel,
//           });
//         }
//       }
//     }
//     prevCasesLength.current = cases.length;
//   }, [cases, loading, activeNotification]);

//   return (
//     <div id="swasti-app-container" className="flex flex-col lg:flex-row bg-slate-50 min-h-screen text-slate-800 font-sans relative">
      
//       {/* Real-time Notification Banner / Toast */}
//       {activeNotification && (
//         <div className="fixed top-4 right-4 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800/80 p-5 animate-slide-in overflow-hidden">
//           {/* Accent decoration */}
//           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-400"></div>
          
//           <div className="flex gap-4 items-start">
//             <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl flex-shrink-0 animate-bounce">
//               <Bell className="w-5 h-5" />
//             </div>
            
//             <div className="flex-1 space-y-1">
//               <div className="flex justify-between items-start">
//                 <span className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase flex items-center gap-1">
//                   <span className="relative flex h-2 w-2">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
//                   </span>
//                   OT Live Dispatch Notification
//                 </span>
//                 <button 
//                   onClick={() => setActiveNotification(null)}
//                   className="text-slate-400 hover:text-white transition"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
              
//               <h4 className="font-bold text-sm tracking-tight text-slate-100">
//                 New Surgery Recommended!
//               </h4>
              
//               <p className="text-xs text-slate-300 leading-relaxed pt-1">
//                 <strong className="text-white">{activeNotification.recommendedBy}</strong> recommended surgery for <strong className="text-white">{activeNotification.patientName}</strong>.
//               </p>
              
//               <div className="bg-slate-800/60 p-2.5 rounded-lg text-[11px] space-y-0.5 border border-slate-700/40 font-mono mt-2">
//                 <div>Procedure: <span className="text-teal-300 font-bold">{activeNotification.surgeryName}</span></div>
//                 <div>Priority: <span className={`font-bold ${activeNotification.priority === 'Immediate' ? 'text-rose-400' : 'text-amber-300'}`}>{activeNotification.priority}</span></div>
//                 <div>Sync status: <span className="text-emerald-400">Persistent PostgreSQL Written ✓</span></div>
//               </div>

//               <div className="flex gap-3 pt-3">
//                 <button
//                   onClick={() => {
//                     setActiveNotification(null);
//                     router.push(`/ot`);
//                   }}
//                   className="flex-1 py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
//                 >
//                   Go to OT Occupancy <ChevronRight className="w-3.5 h-3.5" />
//                 </button>
//                 <button
//                   onClick={() => {
//                     setActiveNotification(null);
//                     router.push(`/ot/cases/${activeNotification.id}`);
//                   }}
//                   className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
//                 >
//                   Track Case
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Top Bar */}
//       <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#F4F9F7] border-b border-[#E2EFEA] sticky top-0 z-30">
//         <div className="flex items-center gap-2">
//           <button 
//             onClick={() => setIsSidebarOpen(true)}
//             className="p-1.5 text-[#4A6B66] hover:text-[#2BB2A7] hover:bg-[#EAF7F4] rounded-lg transition-colors cursor-pointer"
//             title="Open menu"
//           >
//             <Menu className="w-6 h-6" />
//           </button>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] rounded-lg flex items-center justify-center">
//               <Activity className="w-4.5 h-4.5 text-white" />
//             </div>
//             <span className="font-bold text-sm text-[#1A1A1A]">SWASTI AI</span>
//           </div>
//         </div>
//         <div className="flex items-center gap-1.5 bg-[#EAF7F4]/80 px-2 py-0.5 rounded-lg border border-[#E2EFEA]">
//           <span className="relative flex h-1.5 w-1.5">
//             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2BB2A7] opacity-75"></span>
//             <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2BB2A7]"></span>
//           </span>
//           <span className="text-[10px] font-bold text-[#1F8F89] font-mono">HIS OK</span>
//         </div>
//       </header>

//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
//       <main className="flex-1 overflow-y-auto lg:h-screen p-4 md:p-8">
//         {children}
//       </main>
//     </div>
//   );
// }

// export default function ClientLayoutWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <CasesProvider>
//       <ClientLayoutContent>
//         {children}
//       </ClientLayoutContent>
//     </CasesProvider>
//   );
// }





"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CasesProvider, useCases } from '@/context/CasesContext';
import Sidebar from './Sidebar';
import { Menu, Activity, Bell, Database, X, ChevronRight, CheckSquare, Sparkles } from 'lucide-react';

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cases, loading } = useCases();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    patientName: string;
    surgeryName: string;
    recommendedBy: string;
    priority: string;
  } | null>(null);

  const prevCasesLength = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (loading) return;

    if (isInitialLoad.current) {
      prevCasesLength.current = cases.length;
      isInitialLoad.current = false;
      return;
    }

    if (prevCasesLength.current !== null && cases.length > prevCasesLength.current) {
      // Find newly recommended cases by checking if there's a case that has status 'Recommended'
      // and whose ID was not in a previously known set (or just select the newest recommended one)
      const recommendedCases = cases.filter(c => c.status === 'Recommended');
      if (recommendedCases.length > 0) {
        // Take the latest recommended one
        const newestCase = recommendedCases[0];
        
        // Only trigger if we aren't already displaying it
        if (!activeNotification || activeNotification.id !== newestCase.id) {
          setActiveNotification({
            id: newestCase.id,
            patientName: newestCase.patient.name,
            surgeryName: newestCase.recommendation.surgeryName,
            recommendedBy: newestCase.recommendation.recommendedBy,
            priority: newestCase.recommendation.priorityLevel,
          });
        }
      }
    }
    prevCasesLength.current = cases.length;
  }, [cases, loading, activeNotification]);

  const isConsentSignPage = pathname 
    ? (pathname.includes('consent-sign') || pathname.includes('patient-consent-sign'))
    : (typeof window !== 'undefined' ? (window.location.pathname.includes('consent-sign') || window.location.pathname.includes('patient-consent-sign')) : false);

  if (mounted && isConsentSignPage) {
    return (
      <div className="bg-[#FAF9F5] min-h-screen text-slate-800 font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <div id="swasti-app-container" className="flex flex-col lg:flex-row bg-slate-50 min-h-screen text-slate-800 font-sans relative">
      {isConsentSignPage && (
        <style dangerouslySetInnerHTML={{__html: `
          #app-sidebar, header.lg\\:hidden { display: none !important; }
          #swasti-app-container { display: block !important; background-color: #FAF9F5 !important; }
          main { padding: 0 !important; height: auto !important; }
        `}} />
      )}
      
      {/* Real-time Notification Banner / Toast */}
      {activeNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800/80 p-5 animate-slide-in overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-amber-400"></div>
          
          <div className="flex gap-4 items-start">
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl flex-shrink-0 animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
                  </span>
                  OT Live Dispatch Notification
                </span>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <h4 className="font-bold text-sm tracking-tight text-slate-100">
                New Surgery Recommended!
              </h4>
              
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                <strong className="text-white">{activeNotification.recommendedBy}</strong> recommended surgery for <strong className="text-white">{activeNotification.patientName}</strong>.
              </p>
              
              <div className="bg-slate-800/60 p-2.5 rounded-lg text-[11px] space-y-0.5 border border-slate-700/40 font-mono mt-2">
                <div>Procedure: <span className="text-teal-300 font-bold">{activeNotification.surgeryName}</span></div>
                <div>Priority: <span className={`font-bold ${activeNotification.priority === 'Immediate' ? 'text-rose-400' : 'text-amber-300'}`}>{activeNotification.priority}</span></div>
                <div>Sync status: <span className="text-emerald-400">Persistent PostgreSQL Written ✓</span></div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setActiveNotification(null);
                    router.push(`/ot`);
                  }}
                  className="flex-1 py-1.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Go to OT Occupancy <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setActiveNotification(null);
                    router.push(`/ot/cases/${activeNotification.id}`);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  Track Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#F4F9F7] border-b border-[#E2EFEA] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-[#4A6B66] hover:text-[#2BB2A7] hover:bg-[#EAF7F4] rounded-lg transition-colors cursor-pointer"
            title="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] rounded-lg flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-sm text-[#1A1A1A]">SWASTI AI</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#EAF7F4]/80 px-2 py-0.5 rounded-lg border border-[#E2EFEA]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2BB2A7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2BB2A7]"></span>
          </span>
          <span className="text-[10px] font-bold text-[#1F8F89] font-mono">HIS OK</span>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto lg:h-screen p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CasesProvider>
      <ClientLayoutContent>
        {children}
      </ClientLayoutContent>
    </CasesProvider>
  );
}
