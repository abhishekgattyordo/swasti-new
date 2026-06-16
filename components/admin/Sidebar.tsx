

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   HealthAndSafety,
//   Dashboard,
//   Domain,
//   People,
//   Person,
//   ChevronLeft,
//   ChevronRight,
//   Hotel,
//   Logout,
//   Badge,
// } from '@mui/icons-material';
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function Sidebar({ isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userName, setUserName] = useState('Admin');
//   const [userRole, setUserRole] = useState('Administrator');
  
//   // Get tenant data from context
//   const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();
  
//   // Get tenant name from tenant object
//   const tenantName = tenant?.name || "";
//   const tenantSlug = tenant?.slug || "";

//   // Function to capitalize first letter of each word in a name
//   const capitalizeName = (name: string) => {
//     if (!name) return 'Admin';
//     return name
//       .split(' ')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   };

//   useEffect(() => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         const rawName = user.full_name_en || user.name || 'Admin';
//         setUserName(capitalizeName(rawName));
//         setUserRole(user.role === 'admin' ? 'System Administrator' : 'Administrator');
//       } catch (e) {
//         console.error('Failed to parse user', e);
//       }
//     }
//   }, []);

//   const toggleCollapse = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.DASHBOARD);
//   const isDoctorsEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.DOCTORS);
//   const isPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.PATIENTS);
//   const isBedConfigEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.BED_CONFIGURATION);
//   const isStaffEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.STAFF);

//   const navItems = [
//     { icon: Dashboard, label: 'Dashboard', href: '/admin/healthcaredashboard', color: 'from-blue-500 to-blue-700', isEnabled: isDashboardEnabled },
//     { icon: People, label: 'Doctors', href: '/admin/doctorsmanagement', badge: "", color: 'from-emerald-500 to-emerald-700', isEnabled: isDoctorsEnabled },
//      { icon: Badge, label: 'Staff', href: '/admin/staffmanagement', color: 'from-cyan-500 to-cyan-700', isEnabled: isStaffEnabled },
//     { icon: Person, label: 'Patients', href: '/admin/patientmanagement', badge: "", color: 'from-purple-500 to-purple-700', isEnabled: isPatientsEnabled },
//     { icon: Domain, label: 'Bed Management', href: '/admin/bed-management', color: 'from-amber-500 to-amber-700', isEnabled: isBedConfigEnabled },
//     { icon: Hotel, label: 'Bed Configuration', href: '/admin/bed-configuration', color: 'from-indigo-500 to-indigo-700', isEnabled: isBedConfigEnabled },
//   ];

//   const quickAccessItems = [
//     { icon: Person, label: 'Add New Patient', href: '/admin/addnewpatient', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
//     { icon: People, label: 'Add New Doctor', href: '/admin/addnewdoctor', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
//     { icon: Badge, label: 'Add New Staff', href: '/admin/addnewstaff', iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
//   ];

//   const visibleNavItems = navItems.filter(item => item.isEnabled !== false);

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
//                 <HealthAndSafety className="text-2xl text-gray-400" />
//               </div>
//               <div className="animate-pulse">
//                 <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
//                 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
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
//       } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//     >
//       {/* Close button for mobile */}
//       <button
//         className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//         onClick={onClose}
//       >
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//         </svg>
//       </button>

//       {/* Logo Section */}
//       <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
//         {!isCollapsed ? (
//           <Link href="/admin/healthcaredashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <HealthAndSafety className="text-2xl" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight dark:text-white">{tenantName || 'HealthSync'}</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Multi-Facility Management System</p>
//             </div>
//           </Link>
//         ) : (
//           <Link href="/admin/healthcaredashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <HealthAndSafety className="text-2xl" />
//             </div>
//           </Link>
//         )}

//         {/* Collapse Button */}
//         <button
//           onClick={toggleCollapse}
//           className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
//             isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
//           }`}
//         >
//           {isCollapsed ? <ChevronRight className="text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="text-gray-600 dark:text-gray-300" />}
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
//                       className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-4'} px-4 py-3 rounded-xl transition-all group relative ${
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
//                           <item.icon className="text-lg" />
//                         </div>
//                         {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                       </div>
//                       {!isCollapsed && item.badge && (
//                         <span className={`text-xs font-bold px-2 py-1 rounded-full ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
//                           {item.badge}
//                         </span>
//                       )}
//                       {isCollapsed && item.badge && (
//                         <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
//                       )}
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

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
//                       <item.icon className="text-lg" />
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
//                     <item.icon className="text-lg" />
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </nav>

//         {/* User Info (non‑clickable) + Logout icon */}
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
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userRole}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                   title="Logout"
//                 >
//                   <Logout className="text-2xl" />
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
//                   className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                   title="Logout"
//                 >
//                   <Logout className="text-2xl" />
//                 </button>
//               </div>
//             )}
//             {!isCollapsed && (
//               <div className="mt-3 px-3">
//                 <p className="text-xs text-gray-400 dark:text-gray-500">Admin Portal v1.0.0</p>
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
import {
  HealthAndSafety,
  Dashboard,
  Domain,
  People,
  Person,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Logout,
  Badge,
} from '@mui/icons-material';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('Administrator');
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();

  const capitalizeName = (name: string) => {
    if (!name) return 'Admin';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const rawName = user.full_name_en || user.name || 'Admin';
        setUserName(capitalizeName(rawName));
        setUserRole(user.role === 'admin' ? 'System Administrator' : 'Administrator');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.DASHBOARD);
  const isDoctorsEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.DOCTORS);
  const isPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.PATIENTS);
  const isBedConfigEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.BED_CONFIGURATION);
  const isStaffEnabled = isMicroFeatureEnabled(MODULE_KEYS.ADMIN, ADMIN_FEATURES.STAFF);

  const navItems = [
    { icon: Dashboard, label: 'Dashboard', href: '/admin/healthcaredashboard', color: 'from-blue-500 to-blue-700', isEnabled: isDashboardEnabled },
    { icon: People, label: 'Doctors', href: '/admin/doctorsmanagement', badge: "", color: 'from-emerald-500 to-emerald-700', isEnabled: isDoctorsEnabled },
    { icon: Badge, label: 'Staff', href: '/admin/staffmanagement', color: 'from-cyan-500 to-cyan-700', isEnabled: isStaffEnabled },
    { icon: Person, label: 'Patients', href: '/admin/patientmanagement', badge: "", color: 'from-purple-500 to-purple-700', isEnabled: isPatientsEnabled },
    { icon: Domain, label: 'Bed Management', href: '/admin/bed-management', color: 'from-amber-500 to-amber-700', isEnabled: isBedConfigEnabled },
    { icon: Hotel, label: 'Bed Configuration', href: '/admin/bed-configuration', color: 'from-indigo-500 to-indigo-700', isEnabled: isBedConfigEnabled },
  ];

  const quickAccessItems = [
    { icon: Person, label: 'Add New Patient', href: '/admin/addnewpatient' },
    { icon: People, label: 'Add New Doctor', href: '/admin/addnewdoctor' },
    { icon: Badge, label: 'Add New Staff', href: '/admin/addnewstaff' },
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
        } flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 relative`}>
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
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? 'w-24' : 'w-80'
        } flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        <button
          className="lg:hidden absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo Section - Left aligned with Text Below */}
        <div className={`px-4 py-1 flex flex-col items-start border-b border-gray-100 dark:border-gray-800 relative`}>
          <Link href="/admin/healthcaredashboard" className="flex flex-col items-start w-full" onClick={handleLinkClick}>
            {/* Logo - Left aligned - Large size and no background */}
            <div className="w-full flex justify-start">
              <div className="w-40 relative -ml-6">
                <img
                  src="/OrDo%20New%20Logo.png"
                  alt="OrDo Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Text - Admin with Admin Module subtitle */}
            {!isCollapsed && (
              <div className="w-full mt-1">
                <h1 className="text-lg font-bold tracking-tight text-[#3B1E6F] dark:text-white text-left">
                  Admin Module
                </h1>
               
              </div>
            )}
          </Link>

          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50 ${
              isCollapsed 
                ? 'absolute -right-1 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' 
                : 'absolute -right-1 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm'
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="text-[#7A329F] text-sm" />
            ) : (
              <ChevronLeft className="text-[#7A329F] text-sm" />
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {visibleNavItems.length > 0 && (
              <div className="mb-4">
                {!isCollapsed && <p className="text-[10px] font-medium text-[#3B1E6F] uppercase tracking-wider px-3 mb-2">Main Navigation</p>}
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
                              ? 'bg-gradient-to-r from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] text-white shadow-sm'
                              : 'text-[#1A438A] hover:bg-[#3B1E6F]/5'
                          }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                            <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                              active ? 'text-white' : 'text-[#7A329F]'
                            }`}>
                              <item.icon className="text-sm" />
                            </div>
                            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                          </div>
                          {!isCollapsed && item.badge && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                              active ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#1A438A]'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {isCollapsed && item.badge && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-medium text-[#3B1E6F] uppercase tracking-wider px-3 mb-2">Quick Access</p>
                <div className="space-y-1">
                  {quickAccessItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#1A438A] hover:bg-[#3B1E6F]/5 transition-colors"
                    >
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7A329F]">
                        <item.icon className="text-sm" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
                {quickAccessItems.map((item) => (
                  <div 
                    key={item.label} 
                    className="relative"
                    onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className="flex items-center justify-center px-3 py-2 rounded-lg text-[#1A438A] hover:bg-[#3B1E6F]/5 transition-colors"
                    >
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7A329F]">
                        <item.icon className="text-sm" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="p-3">
              {!isCollapsed ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] flex items-center justify-center text-white font-semibold text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-gray-900 dark:text-white">{userName}</p>
                      <p className="text-[10px] text-[#1A438A] dark:text-gray-400 truncate">{userRole}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Logout"
                  >
                    <Logout className="text-sm" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B1E6F] via-[#7A329F] to-[#0D5CB3] flex items-center justify-center text-white font-semibold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Logout"
                  >
                    <Logout className="text-sm" />
                  </button>
                </div>
              )}
              {!isCollapsed && (
                <div className="mt-2 px-2">
                  <p className="text-[8px] text-[#1A438A]/50 dark:text-gray-500 text-center">Admin Portal v1.0.0</p>
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