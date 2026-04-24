// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   HealthAndSafety,
//   Dashboard,
//   CalendarMonth,
//   FolderShared,
//   Medication,
//   ReceiptLong,
//   Settings,
//   Person,
//   ChevronLeft,
//   ChevronRight,
//   Logout,
//   EventNote,
// } from '@mui/icons-material';
// import { CalendarDays } from 'lucide-react';

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function Sidebar({ isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Lazy initialization to read from localStorage without an effect
//   const [userName] = useState(() => {
//     if (typeof window === 'undefined') return 'Patient';
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return 'Patient';
//     try {
//       const user = JSON.parse(userStr);
//       return user.full_name_en || user.name || 'Patient';
//     } catch {
//       return 'Patient';
//     }
//   });

//   const [patientId] = useState(() => {
//     if (typeof window === 'undefined') return '';
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return '';
//     try {
//       const user = JSON.parse(userStr);
//       return user.patient_id || user.id || '';
//     } catch {
//       return '';
//     }
//   });


// // Use the current date (or a selected date from state)
// const today = new Date().toISOString().split('T')[0];
// const selectedDate = today; // replace with actual selected date if you have one

// const admissionSummaryHref = `/patient/inpatient-summary?patientId=${patientId}&date=${selectedDate}`;
//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   const navItems = [
//     { icon: Dashboard, label: 'Dashboard', href: '/patient/dashboard', color: 'from-green-500 to-green-700' },
//     { icon: FolderShared, label: 'Medical Records', href: '/patient/medical-records', color: 'from-green-500 to-green-700' },
//     { icon: Medication, label: 'Prescriptions', href: '/patient/prescriptions', color: 'from-emerald-500 to-emerald-700' },
//     { icon: ReceiptLong, label: 'Billing', href: '/patient/billing', color: 'from-green-500 to-green-700' },
//  {
//   icon: CalendarDays,
//   label: 'Admission Summary',
//   href: admissionSummaryHref,
//   color: 'from-green-500 to-green-700',
// }
//   ];

//   const settingsItems = [
//     { icon: Person, label: 'Profile', href: '/patient/patient-profile', color: 'from-gray-500 to-gray-700' },
//   ];

//   const quickAccessItems = [
//     { icon: CalendarMonth, label: 'Book Appointment', href: '/appointments', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
//   ];

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
//         isCollapsed ? 'w-20' : 'w-80'
//       } flex-shrink-0 border-r border-green-200 dark:border-green-900 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//     >
//       {/* Mobile close button */}
//       <button
//         className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//         onClick={onClose}
//       >
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//         </svg>
//       </button>

//       {/* Logo Section */}
//       <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-green-200 dark:border-green-900 relative`}>
//         {!isCollapsed ? (
//           <Link href="/patient/dashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <HealthAndSafety className="text-2xl" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Patient Portal</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your Health Partner</p>
//             </div>
//           </Link>
//         ) : (
//           <Link href="/patient/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <HealthAndSafety className="text-2xl" />
//             </div>
//           </Link>
//         )}

//         {/* Collapse button */}
//         <button
//           onClick={toggleCollapse}
//           className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg border border-green-500 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors z-40 ${
//             isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 shadow-sm' : ''
//           }`}
//           title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {isCollapsed ? <ChevronRight className="text-green-600 dark:text-green-400 text-lg" /> : <ChevronLeft className="text-green-600 dark:text-green-400 text-lg" />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 flex flex-col min-h-0">
//         <nav className="flex-1 overflow-y-auto px-4 py-8">
//           {/* Main Navigation */}
//           <div className="mb-6">
//             {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Patient Menu</p>}
//             <div className="space-y-1">
//               {navItems.map((item) => {
//                 const active = isActive(item.href);
//                 return (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     onClick={handleLinkClick}
//                     className={`flex items-center ${
//                       isCollapsed ? 'justify-center' : 'justify-between gap-4'
//                     } px-4 py-3 rounded-xl transition-all group relative ${
//                       active
//                         ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30 shadow-sm'
//                         : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
//                     }`}
//                     title={isCollapsed ? item.label : ''}
//                   >
//                     <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                         active ? 'bg-green-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                       }`}>
//                         <item.icon className="text-lg" />
//                       </div>
//                       {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                     </div>
                  
                  
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Account Settings */}
//           <div className="mb-6">
//             {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Account</p>}
//             <div className="space-y-1">
//               {settingsItems.map((item) => {
//                 const active = isActive(item.href);
//                 return (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     onClick={handleLinkClick}
//                     className={`flex items-center ${
//                       isCollapsed ? 'justify-center' : 'justify-between gap-4'
//                     } px-4 py-3 rounded-xl transition-all group relative ${
//                       active
//                         ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm'
//                         : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
//                     }`}
//                     title={isCollapsed ? item.label : ''}
//                   >
//                     <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                         active ? 'bg-gray-500 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                       }`}>
//                         <item.icon className="text-lg" />
//                       </div>
//                       {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Quick Actions */}
//           {!isCollapsed && (
//             <div className="pt-4">
//               <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Quick Actions</p>
//               <div className="space-y-1">
//                 {quickAccessItems.map((item) => (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     onClick={handleLinkClick}
//                     className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
//                   >
//                     <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
//                       <item.icon className="text-lg" />
//                     </div>
//                     <span className="text-sm font-medium">{item.label}</span>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           )}

//           {isCollapsed && (
//             <div className="pt-4 space-y-1">
//               {quickAccessItems.map((item) => (
//                 <Link
//                   key={item.label}
//                   href={item.href}
//                   onClick={handleLinkClick}
//                   className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group relative"
//                   title={item.label}
//                 >
//                   <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
//                     <item.icon className="text-lg" />
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </nav>

//         {/* User Profile & Logout */}
//         <div className="mt-auto border-t border-green-200 dark:border-green-900 bg-white dark:bg-gray-900">
//           <div className="p-4">
//             {!isCollapsed ? (
//               <div className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-semibold text-sm">
//                     {userName.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                       Patient ID: {patientId || 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
//                   title="Logout"
//                 >
//                   <Logout className="text-gray-400 text-sm hover:text-red-500 dark:hover:text-red-400" />
//                 </button>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center gap-2">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-semibold text-sm">
//                   {userName.charAt(0).toUpperCase()}
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
//                   title="Logout"
//                 >
//                   <Logout className="text-gray-400 text-sm hover:text-red-500 dark:hover:text-red-400" />
//                 </button>
//               </div>
//             )}
//             {!isCollapsed && (
//               <div className="mt-3 px-3">
//                 <p className="text-xs text-gray-400">Patient Portal v1.0.0</p>
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
  HealthAndSafety,
  Dashboard,
  CalendarMonth,
  FolderShared,
  Medication,
  ReceiptLong,
  Person,
  ChevronLeft,
  ChevronRight,
  Logout,
} from '@mui/icons-material';
import { CalendarDays } from 'lucide-react';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PATIENT_FEATURES } from "@/lib/feature";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get tenant data from context
  const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();
  
  // Get tenant name from tenant object
  const tenantName = tenant?.name || "";
  const tenantSlug = tenant?.slug || "";

  // Lazy initialization to read from localStorage without an effect
  const [userName] = useState(() => {
    if (typeof window === 'undefined') return 'Patient';
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'Patient';
    try {
      const user = JSON.parse(userStr);
      return user.full_name_en || user.name || 'Patient';
    } catch {
      return 'Patient';
    }
  });

  const [patientId] = useState(() => {
    if (typeof window === 'undefined') return '';
    const userStr = localStorage.getItem('user');
    if (!userStr) return '';
    try {
      const user = JSON.parse(userStr);
      return user.patient_id || user.id || '';
    } catch {
      return '';
    }
  });

  // Use the current date (or a selected date from state)
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = today; // replace with actual selected date if you have one

  const admissionSummaryHref = `/patient/inpatient-summary?patientId=${patientId}&date=${selectedDate}`;
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Check which features are enabled
  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.DASHBOARD);
  const isMedicalRecordsEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.MEDICAL_RECORDS);
  const isPrescriptionEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.PRESCRIPTION);
  const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.BILLING);
  const isAdmissionSummaryEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.ADMISSION_SUMMARY);
  const isProfileEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.PROFILE);
  const isBookAppointmentEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.BOOK_APPOINTMENT);

  const navItems = [
    { icon: Dashboard, label: 'Dashboard', href: '/patient/dashboard', color: 'from-green-500 to-green-700', isEnabled: isDashboardEnabled },
    { icon: FolderShared, label: 'Medical Records', href: '/patient/medical-records', color: 'from-green-500 to-green-700', isEnabled: isMedicalRecordsEnabled },
    { icon: Medication, label: 'Prescriptions', href: '/patient/prescriptions', color: 'from-emerald-500 to-emerald-700', isEnabled: isPrescriptionEnabled },
    { icon: ReceiptLong, label: 'Billing', href: '/patient/billing', color: 'from-green-500 to-green-700', isEnabled: isBillingEnabled },
    { icon: CalendarDays, label: 'Admission Summary', href: admissionSummaryHref, color: 'from-green-500 to-green-700', isEnabled: isAdmissionSummaryEnabled },
  ];

  const settingsItems = [
    { icon: Person, label: 'Profile', href: '/patient/patient-profile', color: 'from-gray-500 to-gray-700', isEnabled: isProfileEnabled },
  ];

  const quickAccessItems = [
    { icon: CalendarMonth, label: 'Book Appointment', href: '/appointments', iconBg: 'bg-green-50', iconColor: 'text-green-600', isEnabled: isBookAppointmentEnabled },
  ];

  // Filter items based on feature flags
  const visibleNavItems = navItems.filter(item => item.isEnabled !== false);
  const visibleSettingsItems = settingsItems.filter(item => item.isEnabled !== false);
  const visibleQuickAccessItems = quickAccessItems.filter(item => item.isEnabled !== false);

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
          isCollapsed ? 'w-20' : 'w-80'
        } flex-shrink-0 border-r border-green-200 dark:border-green-900 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        {/* Logo Section with Loading Skeleton */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-green-200 dark:border-green-900 relative`}>
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
                <HealthAndSafety className="text-2xl text-gray-400" />
              </div>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
                <HealthAndSafety className="text-2xl text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
        isCollapsed ? 'w-20' : 'w-80'
      } flex-shrink-0 border-r border-green-200 dark:border-green-900 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
    >
      {/* Mobile close button */}
      <button
        className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-green-200 dark:border-green-900 relative`}>
        {!isCollapsed ? (
          <Link href="/patient/dashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <HealthAndSafety className="text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{tenantName || 'Patient Portal'}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your Health Partner</p>
            </div>
          </Link>
        ) : (
          <Link href="/patient/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <HealthAndSafety className="text-2xl" />
            </div>
          </Link>
        )}

        {/* Collapse button */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg border border-green-500 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors z-40 ${
            isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 shadow-sm' : ''
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="text-green-600 dark:text-green-400 text-lg" /> : <ChevronLeft className="text-green-600 dark:text-green-400 text-lg" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto px-4 py-8">
          {/* Main Navigation */}
          {visibleNavItems.length > 0 && (
            <div className="mb-6">
              {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Patient Menu</p>}
              <div className="space-y-1">
                {visibleNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-between gap-4'
                      } px-4 py-3 rounded-xl transition-all group relative ${
                        active
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                          active ? 'bg-green-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
                        }`}>
                          <item.icon className="text-lg" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Settings */}
          {visibleSettingsItems.length > 0 && (
            <div className="mb-6">
              {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Account</p>}
              <div className="space-y-1">
                {visibleSettingsItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-between gap-4'
                      } px-4 py-3 rounded-xl transition-all group relative ${
                        active
                          ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                          active ? 'bg-gray-500 text-white' : `bg-gradient-to-br ${item.color} text-white`
                        }`}>
                          <item.icon className="text-lg" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {visibleQuickAccessItems.length > 0 && (
            <>
              {!isCollapsed ? (
                <div className="pt-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Quick Actions</p>
                  <div className="space-y-1">
                    {visibleQuickAccessItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleLinkClick}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                          <item.icon className="text-lg" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-4 space-y-1">
                  {visibleQuickAccessItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group relative"
                      title={item.label}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                        <item.icon className="text-lg" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto border-t border-green-200 dark:border-green-900 bg-white dark:bg-gray-900">
          <div className="p-4">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      Patient ID: {patientId || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Logout"
                >
                  <Logout className="text-gray-400 text-sm hover:text-red-500 dark:hover:text-red-400" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Logout"
                >
                  <Logout className="text-gray-400 text-sm hover:text-red-500 dark:hover:text-red-400" />
                </button>
              </div>
            )}
            {!isCollapsed && (
              <div className="mt-3 px-3">
                <p className="text-xs text-gray-400">Patient Portal v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}