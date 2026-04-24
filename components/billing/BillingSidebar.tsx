// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   LayoutDashboard,
//   Users,
//   Receipt,
//   CreditCard,
//   FileText,
//   TrendingUp,
//   Calendar,
//   AlertCircle,
//   ChevronLeft,
//   ChevronRight,
//   LogOut,
//    BookOpen,
//   X,
// } from 'lucide-react';
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, BILLING_FEATURES } from "@/lib/feature";

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function BillingSidebar({ isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const { isMicroFeatureEnabled } = useTenant();

//   // Lazy initialization – read from localStorage once, no effect needed
//   const [userName] = useState(() => {
//     if (typeof window === 'undefined') return 'Billing Officer';
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return 'Billing Officer';
//     try {
//       const user = JSON.parse(userStr);
//       return user.full_name_en || user.name || 'Billing Officer';
//     } catch {
//       return 'Billing Officer';
//     }
//   });

//   const [userRole] = useState(() => {
//     if (typeof window === 'undefined') return 'Billing Admin';
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return 'Billing Admin';
//     try {
//       const user = JSON.parse(userStr);
//       return user.role === 'billing' ? 'Billing Admin' : 'Billing Staff';
//     } catch {
//       return 'Billing Admin';
//     }
//   });

//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.DASHBOARD);
// const isAdmittedPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.ADMITTED_PATIENT_BILLING);
// const isAllBillsEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.ALL_BILLS);
// const isDischargeSummaryEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.DISCHARGE_SUMMARY);
// const isLedgerEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.LEDGER);

// const navItems = [
//   { icon: LayoutDashboard, label: 'Dashboard', href: '/billing/dashboard', color: 'from-blue-500 to-blue-700', isEnabled: isDashboardEnabled },
//   { icon: Users, label: 'Admitted Patients', href: '/billing/admitted-patients', color: 'from-green-500 to-green-700', isEnabled: isAdmittedPatientsEnabled },
//   { icon: Receipt, label: 'All Bills', href: '/billing/bills', badge: 3, color: 'from-purple-500 to-purple-700', isEnabled: isAllBillsEnabled },
//   { icon: Calendar, label: 'Discharge Summary', href: '/billing/discharge-summary', color: 'from-indigo-500 to-indigo-700', isEnabled: isDischargeSummaryEnabled },
//   { icon: BookOpen, label: 'Ledger', href: '/billing/ledger', color: 'from-cyan-500 to-cyan-700', isEnabled: isLedgerEnabled },
// ];

// const visibleNavItems = navItems.filter(item => item.isEnabled !== false);

//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) onClose();
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
//     if (window.innerWidth < 1024) onClose();
//     router.push('/login');
//   };

//   const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

//   return (
//     <aside
//       className={`${
//         isOpen ? 'translate-x-0' : '-translate-x-full'
//       } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
//         isCollapsed ? 'w-24' : 'w-80'
//       } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//     >
//       {/* Mobile close button */}
//       <button
//         className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//         onClick={onClose}
//       >
//         <X className="w-5 h-5" />
//       </button>

//       {/* Logo Section */}
//       <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
//         {!isCollapsed ? (
//           <Link href="/billing/dashboard" className="flex items-center gap-3" onClick={handleLinkClick}>
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Receipt className="text-xl" />
//             </div>
//             <div>
//               <h1 className="text-lg font-bold tracking-tight">MediBill</h1>
//               <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">Billing System</p>
//             </div>
//           </Link>
//         ) : (
//           <Link href="/billing/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Receipt className="text-xl" />
//             </div>
//           </Link>
//         )}

//         {/* Collapse button */}
//         <button
//           onClick={toggleCollapse}
//           className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
//             isCollapsed ? 'absolute -right-3.5 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
//           }`}
//           title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {isCollapsed ? <ChevronRight className="text-gray-600 dark:text-gray-300 text-base" /> : <ChevronLeft className="text-gray-600 dark:text-gray-300 text-base" />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 flex flex-col min-h-0">
//         <nav className="flex-1 overflow-y-auto px-3 py-6">
//           <div className="mb-6">
//             {!isCollapsed && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">Billing Menu</p>}
//             <div className="space-y-1">
//               {visibleNavItems.map((item) => {
//                 const active = isActive(item.href);
//                 return (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     onClick={handleLinkClick}
//                     className={`flex items-center ${
//                       isCollapsed ? 'justify-center' : 'justify-between gap-3'
//                     } px-3 py-2.5 rounded-lg transition-all group relative ${
//                       active
//                         ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 shadow-sm'
//                         : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
//                     }`}
//                     title={isCollapsed ? item.label : ''}
//                   >
//                     <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                         active ? 'bg-blue-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                       }`}>
//                         <item.icon className="text-base" />
//                       </div>
//                       {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                     </div>
//                     {!isCollapsed && item.badge && (
//                       <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
//                         active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//                       }`}>
//                         {item.badge}
//                       </span>
//                     )}
//                     {isCollapsed && item.badge && (
//                       <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
//                     )}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>
//         </nav>

//         {/* User Profile & Logout */}
//         <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//           <div className="p-4">
//             {!isCollapsed ? (
//               <div className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                     {userName.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-semibold truncate">{userName}</p>
//                     <p className="text-sm text-gray-500 truncate">{userRole}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
//                   title="Logout"
//                 >
//                   <LogOut className="w-5 h-5" />
//                 </button>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center gap-2">
//                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                   {userName.charAt(0).toUpperCase()}
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
//                   title="Logout"
//                 >
//                   <LogOut className="w-5 h-5" />
//                 </button>
//               </div>
//             )}
//             {!isCollapsed && (
//               <div className="mt-3 px-2">
//                 <p className="text-[8px] text-gray-400">Billing v1.0.0</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  X,
} from 'lucide-react';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, BILLING_FEATURES } from "@/lib/feature";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BillingSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get tenant data from context
  const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();
  
  // Get tenant name from tenant object
  const tenantName = tenant?.name || "";

  // Lazy initialization – read from localStorage once, no effect needed
  const [userName] = useState(() => {
    if (typeof window === 'undefined') return 'Billing Officer';
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'Billing Officer';
    try {
      const user = JSON.parse(userStr);
      return user.full_name_en || user.name || 'Billing Officer';
    } catch {
      return 'Billing Officer';
    }
  });

  const [userRole] = useState(() => {
    if (typeof window === 'undefined') return 'Billing Admin';
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'Billing Admin';
    try {
      const user = JSON.parse(userStr);
      return user.role === 'billing' ? 'Billing Admin' : 'Billing Staff';
    } catch {
      return 'Billing Admin';
    }
  });

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.DASHBOARD);
  const isAdmittedPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.ADMITTED_PATIENT_BILLING);
  const isAllBillsEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.ALL_BILLS);
  const isDischargeSummaryEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.DISCHARGE_SUMMARY);
  const isLedgerEnabled = isMicroFeatureEnabled(MODULE_KEYS.BILLING, BILLING_FEATURES.LEDGER);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/billing/dashboard', color: 'from-blue-500 to-blue-700', isEnabled: isDashboardEnabled },
    { icon: Users, label: 'Admitted Patients', href: '/billing/admitted-patients', color: 'from-green-500 to-green-700', isEnabled: isAdmittedPatientsEnabled },
    { icon: Receipt, label: 'All Bills', href: '/billing/bills', badge: 3, color: 'from-purple-500 to-purple-700', isEnabled: isAllBillsEnabled },
    { icon: Calendar, label: 'Discharge Summary', href: '/billing/discharge-summary', color: 'from-indigo-500 to-indigo-700', isEnabled: isDischargeSummaryEnabled },
    { icon: BookOpen, label: 'Ledger', href: '/billing/ledger', color: 'from-cyan-500 to-cyan-700', isEnabled: isLedgerEnabled },
  ];

  const visibleNavItems = navItems.filter(item => item.isEnabled !== false);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (window.innerWidth < 1024) onClose();
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  // Show loading state while tenant is being fetched
  if (isTenantLoading) {
    return (
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? 'w-24' : 'w-80'
        } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <div className="p-6 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
            {!isCollapsed && (
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
        isCollapsed ? 'w-24' : 'w-80'
      } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
    >
      {/* Mobile close button */}
      <button
        className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
        {!isCollapsed ? (
          <Link href="/billing/dashboard" className="flex items-center gap-3" onClick={handleLinkClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Receipt className="text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{tenantName || 'MediBill'}</h1>
              <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">Billing System</p>
            </div>
          </Link>
        ) : (
          <Link href="/billing/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Receipt className="text-xl" />
            </div>
          </Link>
        )}

        {/* Collapse button */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isCollapsed ? 'absolute -right-3.5 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="text-gray-600 dark:text-gray-300 text-base" /> : <ChevronLeft className="text-gray-600 dark:text-gray-300 text-base" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="mb-6">
            {!isCollapsed && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">Billing Menu</p>}
            <div className="space-y-1">
              {visibleNavItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center ${
                      isCollapsed ? 'justify-center' : 'justify-between gap-3'
                    } px-3 py-2.5 rounded-lg transition-all group relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        active ? 'bg-blue-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
                      }`}>
                        <item.icon className="text-base" />
                      </div>
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-4">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            {!isCollapsed && (
              <div className="mt-3 px-2">
                <p className="text-[8px] text-gray-400">Billing v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}