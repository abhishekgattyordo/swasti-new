

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   Calendar,
//   LayoutDashboard,
//   Users,
//   CreditCard,
//   ChevronLeft,
//   ChevronRight,
//   User,
//   X,
//   Activity,
//   LogOut,
// } from 'lucide-react';
// import { useTenant } from '@/contexts/TenantContext';
// import { MODULE_KEYS, DOCTOR_FEATURES } from '@/lib/feature';

// interface DoctorSidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface NavItem {
//   icon: React.ElementType;
//   label: string;
//   href: string;
//   badge?: string;
//   color: string;
//   featureKey: string;
// }

// export default function DoctorSidebar({ isOpen, onClose }: DoctorSidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userName, setUserName] = useState('Doctor');
//   const [doctorSpecialty, setDoctorSpecialty] = useState('');
  
//   // Get tenant data from context
//   const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();
  
//   // Get tenant name from tenant object
//   const tenantName = tenant?.name || "";
//   const tenantSlug = tenant?.slug || "";

//   useEffect(() => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         // Capitalize the doctor name
//         const rawName = user.full_name_en || user.name || 'Doctor';
//         setUserName(capitalizeName(rawName));
//         setDoctorSpecialty(user.specialty || user.department || 'Physician');
//       } catch (e) {
//         console.error('Failed to parse user', e);
//       }
//     }
     
//   }, []); // run once after mount

//   // Function to capitalize first letter of each word in a name
//   const capitalizeName = (name: string) => {
//     if (!name) return 'Doctor';
//     return name
//       .split(' ')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   };

//   const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.DASHBOARD);
//   const isScheduleEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.SCHEDULE);
//   const isPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.PATIENTS);
//   const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.BILLING);

//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//  const navItems: NavItem[] = [
//   { icon: LayoutDashboard, label: 'Dashboard', href: '/doctor/dashboard', color: 'from-emerald-500 to-emerald-700', featureKey: DOCTOR_FEATURES.DASHBOARD },
//   { icon: Calendar, label: 'Schedule', href: '/doctor/schedule', badge: '', color: 'from-blue-500 to-blue-700', featureKey: DOCTOR_FEATURES.SCHEDULE },
//   { icon: Users, label: 'Patients', href: '/doctor/patients', badge: '', color: 'from-purple-500 to-purple-700', featureKey: DOCTOR_FEATURES.PATIENTS },
//   { icon: Users, label: 'Admitted Patients', href: '/doctor/admitted-patients', badge: '', color: 'from-indigo-500 to-indigo-700', featureKey: 'admitted_patients' },  // ✅ ADD THIS
//   { icon: CreditCard, label: 'Billing', href: '/doctor/billing', badge: '', color: 'from-amber-500 to-amber-700', featureKey: DOCTOR_FEATURES.BILLING },
// ];
//   const visibleNavItems = navItems.filter(item => {
//   switch (item.featureKey) {
//     case DOCTOR_FEATURES.DASHBOARD: return isDashboardEnabled;
//     case DOCTOR_FEATURES.SCHEDULE: return isScheduleEnabled;
//     case DOCTOR_FEATURES.PATIENTS: return isPatientsEnabled;
//     case DOCTOR_FEATURES.BILLING: return isBillingEnabled;
//     case 'admitted_patients': return true;  // ✅ No tenant restriction
//     default: return true;
//   }
// });

//   const quickAccessItems = [
//     { icon: User, label: 'New Appointment', href: '/doctor/patients/new', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
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

//   const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

//   // Show loading state while tenant is being fetched
//   if (isTenantLoading) {
//     return (
//       <aside
//         className={`${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//       >
//         {/* Logo Section with Loading Skeleton */}
//         <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
//           {!isCollapsed && (
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
//                 <Activity className="w-6 h-6 text-gray-400" />
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
//                 <Activity className="w-6 h-6 text-gray-400" />
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
//       } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//     >
//       {/* Close button for mobile */}
//       <button
//         className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//         onClick={onClose}
//       >
//         <X className="w-5 h-5" />
//       </button>

//       {/* Logo Section */}
//       <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
//         {!isCollapsed ? (
//           <Link href="/doctor/dashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Activity className="w-6 h-6" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight dark:text-white">{tenantName || 'HealthSync'}</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Doctor Portal</p>
//             </div>
//           </Link>
//         ) : (
//           <Link href="/doctor/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Activity className="w-6 h-6" />
//             </div>
//           </Link>
//         )}

//         {/* Collapse Button */}
//         <button
//           onClick={toggleCollapse}
//           className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
//             isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
//           }`}
//           title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {isCollapsed ? <ChevronRight className="text-gray-600 dark:text-gray-300 w-4 h-4" /> : <ChevronLeft className="text-gray-600 dark:text-gray-300 w-4 h-4" />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 flex flex-col min-h-0">
//         <nav className="flex-1 overflow-y-auto px-4 py-8">
//           {visibleNavItems.length > 0 && (
//             <div className="mb-6">
//               {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Main Navigation</p>}
//               <div className="space-y-2">
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
//                           ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm'
//                           : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
//                       }`}
//                       title={isCollapsed ? item.label : ''}
//                     >
//                       <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                         <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                           active ? 'bg-blue-500 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                         }`}>
//                           <item.icon className="w-4 h-4" />
//                         </div>
//                         {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                       </div>
//                       {!isCollapsed && item.badge && (
//                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//                           active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//                         }`}>
//                           {item.badge}
//                         </span>
//                       )}
//                       {isCollapsed && item.badge && (
//                         <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
//                       )}
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Quick Access */}
//           {!isCollapsed && (
//             <div className="pt-8">
//               <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Quick Access</p>
//               <div className="space-y-2">
//                 {quickAccessItems.map((item) => (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     onClick={handleLinkClick}
//                     className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
//                   >
//                     <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
//                       <item.icon className="w-4 h-4" />
//                     </div>
//                     <span className="text-sm font-medium">{item.label}</span>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           )}

//           {isCollapsed && (
//             <div className="pt-8 space-y-2">
//               {quickAccessItems.map((item) => (
//                 <Link
//                   key={item.label}
//                   href={item.href}
//                   onClick={handleLinkClick}
//                   className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative"
//                   title={item.label}
//                 >
//                   <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
//                     <item.icon className="w-4 h-4" />
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </nav>

//         {/* User Profile & Logout */}
//         <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//           <div className="p-4">
//             {!isCollapsed ? (
//               // Expanded view: profile and logout on the same row
//               <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                     {userName.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold truncate dark:text-white">{userName}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doctorSpecialty}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
//                   title="Logout"
//                 >
//                   <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
//                 </button>
//               </div>
//             ) : (
//               // Collapsed view: avatar centered, logout icon below
//               <div className="flex flex-col items-center gap-2">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                   {userName.charAt(0).toUpperCase()}
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
//                   title="Logout"
//                 >
//                   <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
//                 </button>
//               </div>
//             )}
//             {!isCollapsed && (
//               <div className="mt-3 px-3">
//                 <p className="text-xs text-gray-400 dark:text-gray-500">Doctor Portal v1.0.0</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  LayoutDashboard,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Activity,
  LogOut,
  Plus,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { MODULE_KEYS, DOCTOR_FEATURES } from '@/lib/feature';

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  featureKey: string;
}

export default function DoctorSidebar({ isOpen, onClose }: DoctorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Doctor');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const rawName = user.full_name_en || user.name || 'Doctor';
        setUserName(capitalizeName(rawName));
        setDoctorSpecialty(user.specialty || user.department || 'Physician');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const capitalizeName = (name: string) => {
    if (!name) return 'Doctor';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.DASHBOARD);
  const isScheduleEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.SCHEDULE);
  const isPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.PATIENTS);
  const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.BILLING);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/doctor/dashboard', featureKey: DOCTOR_FEATURES.DASHBOARD },
    { icon: Calendar, label: 'Schedule', href: '/doctor/schedule', featureKey: DOCTOR_FEATURES.SCHEDULE },
    { icon: Users, label: 'Patients', href: '/doctor/patients', featureKey: DOCTOR_FEATURES.PATIENTS },
    { icon: Users, label: 'Admitted Patients', href: '/doctor/admitted-patients', featureKey: 'admitted_patients' },
    { icon: CreditCard, label: 'Billing', href: '/doctor/billing', featureKey: DOCTOR_FEATURES.BILLING },
  ];

  const visibleNavItems = navItems.filter(item => {
    switch (item.featureKey) {
      case DOCTOR_FEATURES.DASHBOARD: return isDashboardEnabled;
      case DOCTOR_FEATURES.SCHEDULE: return isScheduleEnabled;
      case DOCTOR_FEATURES.PATIENTS: return isPatientsEnabled;
      case DOCTOR_FEATURES.BILLING: return isBillingEnabled;
      case 'admitted_patients': return true;
      default: return true;
    }
  });

  const quickAccessItems = [
    { icon: Plus, label: 'New Appointment', href: '/doctor/patients/new' },
    { icon: User, label: 'Patient List', href: '/doctor/patients' },
  ];

  const visibleQuickAccessItems = quickAccessItems;

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, label: string) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipText(label);
      setTooltipPosition({
        x: rect.right + 12,
        y: rect.top + rect.height / 2
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
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-80'
        } flex-shrink-0 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#E2EFEA] relative`}>
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EAF7F4] rounded-xl flex items-center justify-center animate-pulse">
                <Activity className="w-6 h-6 text-[#2BB2A7]" />
              </div>
              <div className="animate-pulse">
                <div className="h-5 bg-[#EAF7F4] rounded w-32 mb-1"></div>
                <div className="h-3 bg-[#EAF7F4] rounded w-24"></div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="w-12 h-12 bg-[#EAF7F4] rounded-xl flex items-center justify-center animate-pulse">
                <Activity className="w-6 h-6 text-[#2BB2A7]" />
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
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? 'w-24' : 'w-80'
        } flex-shrink-0 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <button
          className="lg:hidden absolute top-6 right-6 p-2 text-[#4A6B66] hover:text-[#2BB2A7] transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section - Left aligned with Text Below */}
        <div className={`px-4 py-1 flex flex-col items-start border-b border-[#E2EFEA] relative`}>
          <Link href="/doctor/dashboard" className="flex items-center gap-3 w-full" onClick={handleLinkClick}>
            {/* Logo */}
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src="/swasti ai logo.png"
                alt="Swasti AI Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Text */}
            {!isCollapsed && (
              <div>
                <h1 className="text-[32px] font-bold tracking-tight text-[#1A1A1A] leading-none">
                  swasti.ai
                </h1>
                <p className="text-sm font-medium text-[#1F8F89] mt-1">
                  Doctor Module
                </p>
              </div>
            )}
          </Link>

          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-[#EAF7F4] transition-colors z-50 ${
              isCollapsed
                ? "absolute -right-1 top-1/2 transform -translate-y-1/2 bg-[#F4F9F7] border border-[#E2EFEA] shadow-sm"
                : "absolute -right-1 top-1/2 transform -translate-y-1/2 bg-[#F4F9F7] border border-[#E2EFEA] shadow-sm"
            }`}
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
                    Doctor Menu
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
                            isCollapsed ? 'justify-center' : 'justify-between gap-3'
                          } px-3 py-2 rounded-lg transition-all ${
                            active
                              ? 'bg-[#EAF7F4] text-[#1A1A1A] font-semibold'
                              : 'text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]'
                          }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                            <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                              active ? 'text-[#2BB2A7]' : 'text-[#2BB2A7]'
                            }`}>
                              <item.icon className="text-sm" />
                            </div>
                            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                          </div>
                          {!isCollapsed && item.badge && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              active ? 'bg-[#2BB2A7]/20 text-[#1F8F89]' : 'bg-[#EAF7F4] text-[#1F8F89]'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {isCollapsed && item.badge && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#F4F9F7]"></span>
                          )}
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
                        {doctorSpecialty}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="text-sm" />
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
                    <LogOut className="text-sm" />
                  </button>
                </div>
              )}
              {!isCollapsed && (
                <div className="mt-2 px-2">
                  <p className="text-[8px] text-[#1F8F89]/50 text-center">
                    Doctor Portal v1.0.0
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
            transform: 'translateY(-50%)'
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