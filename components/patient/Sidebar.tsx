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
//   Person,
//   ChevronLeft,
//   ChevronRight,
//   Logout,
// } from '@mui/icons-material';
// import { CalendarDays } from 'lucide-react';
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, PATIENT_FEATURES } from "@/lib/feature";

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function Sidebar({ isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Get tenant data from context
//   const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();

//   // Get tenant name from tenant object
//   const tenantName = tenant?.name || "";
//   const tenantSlug = tenant?.slug || "";

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

//   // Use the current date (or a selected date from state)
//   const today = new Date().toISOString().split('T')[0];
//   const selectedDate = today; // replace with actual selected date if you have one

//   const admissionSummaryHref = `/patient/inpatient-summary?patientId=${patientId}&date=${selectedDate}`;
//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   // Check which features are enabled
//   const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.DASHBOARD);
//   const isMedicalRecordsEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.MEDICAL_RECORDS);
//   const isPrescriptionEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.PRESCRIPTION);
//   const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.BILLING);
//   const isAdmissionSummaryEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.ADMISSION_SUMMARY);
//   const isProfileEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.PROFILE);
//   const isBookAppointmentEnabled = isMicroFeatureEnabled(MODULE_KEYS.PATIENT, PATIENT_FEATURES.BOOK_APPOINTMENT);

//   const navItems = [
//     { icon: Dashboard, label: 'Dashboard', href: '/patient/dashboard', color: 'from-green-500 to-green-700', isEnabled: isDashboardEnabled },
//     { icon: FolderShared, label: 'Medical Records', href: '/patient/medical-records', color: 'from-green-500 to-green-700', isEnabled: isMedicalRecordsEnabled },
//     { icon: Medication, label: 'Prescriptions', href: '/patient/prescriptions', color: 'from-emerald-500 to-emerald-700', isEnabled: isPrescriptionEnabled },
//     { icon: ReceiptLong, label: 'Billing', href: '/patient/billing', color: 'from-green-500 to-green-700', isEnabled: isBillingEnabled },
//     { icon: CalendarDays, label: 'Admission Summary', href: admissionSummaryHref, color: 'from-green-500 to-green-700', isEnabled: isAdmissionSummaryEnabled },
//   ];

//   const settingsItems = [
//     { icon: Person, label: 'Profile', href: '/patient/patient-profile', color: 'from-gray-500 to-gray-700', isEnabled: isProfileEnabled },
//   ];

//   const quickAccessItems = [
//     { icon: CalendarMonth, label: 'Book Appointment', href: '/appointments', iconBg: 'bg-green-50', iconColor: 'text-green-600', isEnabled: isBookAppointmentEnabled },
//   ];

//   // Filter items based on feature flags
//   const visibleNavItems = navItems.filter(item => item.isEnabled !== false);
//   const visibleSettingsItems = settingsItems.filter(item => item.isEnabled !== false);
//   const visibleQuickAccessItems = quickAccessItems.filter(item => item.isEnabled !== false);

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

//   // Show loading state while tenant is being fetched
//   if (isTenantLoading) {
//     return (
//       <aside
//         className={`${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } flex-shrink-0 border-r border-green-200 dark:border-green-900 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//       >
//         {/* Logo Section with Loading Skeleton */}
//         <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-green-200 dark:border-green-900 relative`}>
//           {!isCollapsed && (
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
//                 <HealthAndSafety className="text-2xl text-gray-400" />
//               </div>
//               <div className="animate-pulse">
//                 <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
//                 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
//               </div>
//             </div>
//           )}
//           {isCollapsed && (
//             <div className="flex items-center justify-center w-full">
//               <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
//                 <HealthAndSafety className="text-2xl text-gray-400" />
//               </div>
//             </div>
//           )}
//         </div>
//       </aside>
//     );
//   }

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
//               <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{tenantName || 'Patient Portal'}</h1>
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
//           {visibleNavItems.length > 0 && (
//             <div className="mb-6">
//               {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Patient Menu</p>}
//               <div className="space-y-1">
//                 {visibleNavItems.map((item) => {
//                   const active = isActive(item.href);
//                   return (
//                     <Link
//                       key={item.label}
//                       href={item.href}
//                       onClick={handleLinkClick}
//                       className={`flex items-center ${
//                         isCollapsed ? 'justify-center' : 'justify-between gap-4'
//                       } px-4 py-3 rounded-xl transition-all group relative ${
//                         active
//                           ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30 shadow-sm'
//                           : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
//                       }`}
//                       title={isCollapsed ? item.label : ''}
//                     >
//                       <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                         <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                           active ? 'bg-green-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                         }`}>
//                           <item.icon className="text-lg" />
//                         </div>
//                         {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Account Settings */}
//           {visibleSettingsItems.length > 0 && (
//             <div className="mb-6">
//               {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Account</p>}
//               <div className="space-y-1">
//                 {visibleSettingsItems.map((item) => {
//                   const active = isActive(item.href);
//                   return (
//                     <Link
//                       key={item.label}
//                       href={item.href}
//                       onClick={handleLinkClick}
//                       className={`flex items-center ${
//                         isCollapsed ? 'justify-center' : 'justify-between gap-4'
//                       } px-4 py-3 rounded-xl transition-all group relative ${
//                         active
//                           ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm'
//                           : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
//                       }`}
//                       title={isCollapsed ? item.label : ''}
//                     >
//                       <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                         <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                           active ? 'bg-gray-500 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                         }`}>
//                           <item.icon className="text-lg" />
//                         </div>
//                         {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Quick Actions */}
//           {visibleQuickAccessItems.length > 0 && (
//             <>
//               {!isCollapsed ? (
//                 <div className="pt-4">
//                   <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Quick Actions</p>
//                   <div className="space-y-1">
//                     {visibleQuickAccessItems.map((item) => (
//                       <Link
//                         key={item.label}
//                         href={item.href}
//                         onClick={handleLinkClick}
//                         className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
//                       >
//                         <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
//                           <item.icon className="text-lg" />
//                         </div>
//                         <span className="text-sm font-medium">{item.label}</span>
//                       </Link>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="pt-4 space-y-1">
//                   {visibleQuickAccessItems.map((item) => (
//                     <Link
//                       key={item.label}
//                       href={item.href}
//                       onClick={handleLinkClick}
//                       className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group relative"
//                       title={item.label}
//                     >
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
//                         <item.icon className="text-lg" />
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </>
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





"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Chat,
} from "@mui/icons-material";
import { CalendarDays } from "lucide-react";
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
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const {
    tenant,
    isLoading: isTenantLoading,
    isMicroFeatureEnabled,
  } = useTenant();

  const [userName] = useState(() => {
    if (typeof window === "undefined") return "Patient";
    const userStr = localStorage.getItem("user");
    if (!userStr) return "Patient";
    try {
      const user = JSON.parse(userStr);
      return user.full_name_en || user.name || "Patient";
    } catch {
      return "Patient";
    }
  });

  const [patientId] = useState(() => {
    if (typeof window === "undefined") return "";
    const userStr = localStorage.getItem("user");
    if (!userStr) return "";
    try {
      const user = JSON.parse(userStr);
      return user.patient_id || user.id || "";
    } catch {
      return "";
    }
  });

  const today = new Date().toISOString().split("T")[0];
  const selectedDate = today;
  const admissionSummaryHref = `/patient/inpatient-summary?patientId=${patientId}&date=${selectedDate}`;
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const isDashboardEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.DASHBOARD,
  );
  const isMedicalRecordsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.MEDICAL_RECORDS,
  );
  const isPrescriptionEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.PRESCRIPTION,
  );
  const isBillingEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.BILLING,
  );
  const isAdmissionSummaryEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.ADMISSION_SUMMARY,
  );
  const isProfileEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.PROFILE,
  );
  const isBookAppointmentEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.PATIENT,
    PATIENT_FEATURES.BOOK_APPOINTMENT,
  );

  const isAiAppointmentEnabled = true;

  const navItems = [
    {
      icon: Dashboard,
      label: "Dashboard",
      href: "/patient/dashboard",
      isEnabled: isDashboardEnabled,
    },
    {
      icon: FolderShared,
      label: "Medical Records",
      href: "/patient/medical-records",
      isEnabled: isMedicalRecordsEnabled,
    },
    {
      icon: Medication,
      label: "Prescriptions",
      href: "/patient/prescriptions",
      isEnabled: isPrescriptionEnabled,
    },
    {
      icon: ReceiptLong,
      label: "Billing",
      href: "/patient/billing",
      isEnabled: isBillingEnabled,
    },
    {
      icon: CalendarDays,
      label: "Admission Summary",
      href: admissionSummaryHref,
      isEnabled: isAdmissionSummaryEnabled,
    },
    {
      icon: Chat,
      label: "AI Appointment",
      href: "/patient/ai-appoitment",
      isEnabled: isAiAppointmentEnabled,
    },
    {
      icon: HealthAndSafety,
      label: "AI Health Plan",
      href: "/patient/healthplan",
      isEnabled: true,
    },
  ];

  const settingsItems = [
    {
      icon: Person,
      label: "Profile",
      href: "/patient/patient-profile",
      isEnabled: isProfileEnabled,
    },
  ];

  const quickAccessItems = [
    {
      icon: CalendarMonth,
      label: "Book Appointment",
      href: "/appointments",
      isEnabled: isBookAppointmentEnabled,
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.isEnabled !== false);
  const visibleSettingsItems = settingsItems.filter(
    (item) => item.isEnabled !== false,
  );
  const visibleQuickAccessItems = quickAccessItems.filter(
    (item) => item.isEnabled !== false,
  );

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    if (window.innerWidth < 1024) onClose();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    label: string,
  ) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipText(label);
      setTooltipPosition({
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipText(null);
  };

  if (isTenantLoading) {
    return (
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? "w-32" : "w-64"
        } flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <div
          className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} border-b border-gray-100 relative`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center animate-pulse">
                <HealthAndSafety className="text-2xl text-gray-400" />
              </div>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-24"></div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center animate-pulse">
                <HealthAndSafety className="text-2xl text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? "w-24" : "w-80"
        } flex-shrink-0 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <button
          className="lg:hidden absolute top-6 right-6 p-2 text-[#4A6B66] hover:text-[#2BB2A7] transition-colors"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Logo Section - Full width */}
        <div className="px-4 py-3 border-b border-[#E2EFEA] relative">
          <Link
            href="/patient/dashboard"
            className="flex flex-col items-start w-full"
            onClick={handleLinkClick}
          >
            {isCollapsed ? (
              <div className="flex justify-center items-center py-2">
                <img
                  src="/swasti ai logo.png"
                  alt="Swasti AI"
                  className="w-20 h-20 object-contain"
                />
              </div>
            ) : (
              <>
                <div className="w-full max-w-[250px] flex-shrink-0">
                  <img
                    src="/Swasti.ai bg rm logo.png"
                    alt="Swasti AI Logo"
                    className="w-auto h-25 object-fill"
                  />
                </div>

                <div className="mt-2 ml-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F8F89]">
                    Patient Module
                  </h2>
                </div>
              </>
            )}
          </Link>

          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-[#EAF7F4] transition-colors z-50 absolute -right-1 top-1/2 transform -translate-y-1/2 bg-[#F4F9F7] border border-[#E2EFEA] shadow-sm"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="text-[#2BB2A7] text-sm" />
            ) : (
              <ChevronLeft className="text-[#2BB2A7] text-sm" />
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {visibleNavItems.length > 0 && (
              <div className="mb-4">
                {!isCollapsed && (
                  <p className="text-[10px] font-medium text-[#1F8F89] uppercase tracking-wider px-3 mb-2">
                    Patient Menu
                  </p>
                )}
                <div className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`flex items-center ${
                            isCollapsed
                              ? "justify-center"
                              : "justify-between gap-3"
                          } px-3 py-2 rounded-lg transition-all ${
                            active
                              ? "bg-[#EAF7F4] text-[#1A1A1A] font-semibold"
                              : "text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]"
                          }`}
                        >
                          <div
                            className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}
                          >
                            <div
                              className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                                active ? "text-[#2BB2A7]" : "text-[#2BB2A7]"
                              }`}
                            >
                              <item.icon className="text-sm" />
                            </div>
                            {!isCollapsed && (
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {visibleSettingsItems.length > 0 && (
              <div className="mb-4">
                {!isCollapsed && (
                  <p className="text-[10px] font-medium text-[#1F8F89] uppercase tracking-wider px-3 mb-2">
                    Account
                  </p>
                )}
                <div className="space-y-1">
                  {visibleSettingsItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`flex items-center ${
                            isCollapsed
                              ? "justify-center"
                              : "justify-between gap-3"
                          } px-3 py-2 rounded-lg transition-all ${
                            active
                              ? "bg-[#EAF7F4] text-[#1A1A1A] font-semibold"
                              : "text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]"
                          }`}
                        >
                          <div
                            className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}
                          >
                            <div
                              className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                                active ? "text-[#2BB2A7]" : "text-[#2BB2A7]"
                              }`}
                            >
                              <item.icon className="text-sm" />
                            </div>
                            {!isCollapsed && (
                              <span className="text-sm font-medium">
                                {item.label}
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isCollapsed && visibleQuickAccessItems.length > 0 && (
              <div className="pt-4 border-t border-[#E2EFEA]">
                <p className="text-[10px] font-medium text-[#1F8F89] uppercase tracking-wider px-3 mb-2">
                  Quick Actions
                </p>
                <div className="space-y-1">
                  {visibleQuickAccessItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A] transition-colors"
                    >
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg text-[#2BB2A7]">
                        <item.icon className="text-sm" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isCollapsed && visibleQuickAccessItems.length > 0 && (
              <div className="pt-4 border-t border-[#E2EFEA] space-y-1">
                {visibleQuickAccessItems.map((item) => (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center justify-center px-3 py-2 rounded-lg text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A] transition-colors"
                    >
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg text-[#2BB2A7]">
                        <item.icon className="text-sm" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto border-t border-[#E2EFEA] bg-[#F4F9F7]">
            <div className="p-3">
              {!isCollapsed ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-[#EAF7F4] rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] flex items-center justify-center text-white font-semibold text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-[#1A1A1A]">
                        {userName}
                      </p>
                      <p className="text-[10px] text-[#1F8F89] font-medium truncate">
                        ID: {patientId || "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <Logout className="text-sm" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] flex items-center justify-center text-white font-semibold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <Logout className="text-sm" />
                  </button>
                </div>
              )}
              {!isCollapsed && (
                <div className="mt-2 px-2">
                  <p className="text-[8px] text-[#1F8F89]/50 text-center">
                    Patient Portal v1.0.0
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Global Tooltip - Rendered at root level */}
      {isCollapsed && tooltipText && (
        <div
          className="fixed px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg z-[9999] pointer-events-none whitespace-nowrap"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translateY(-50%)",
          }}
        >
          {tooltipText}
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </>
  );
}
