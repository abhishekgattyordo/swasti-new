

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   LayoutDashboard,
//   Calendar,
//   Users,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Activity,
//   DoorOpen,
//   Clock,
//   Receipt,
//   LogOut,
// } from 'lucide-react';
// import { useTenant } from '@/contexts/TenantContext';
// import { MODULE_KEYS, HELPDESK_FEATURES } from '@/lib/feature';

// interface HelpDeskSidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onBillingClick: () => void;
//   onRoomAvailabilityClick: () => void;
//   onDoctorSlotsClick: () => void;
// }

// interface NavItem {
//   icon: React.ElementType;
//   label: string;
//   color?: string;
//   iconColor?: string;
//   href?: string;
//   onClick?: () => void;
//   badge?: string;
//   activeCheck?: () => boolean;
//   isEnabled?: boolean;  // ← NEW: feature flag
// }

// export default function HelpDeskSidebar({
//   isOpen,
//   onClose,
//   onBillingClick,
//   onRoomAvailabilityClick,
//   onDoctorSlotsClick,
// }: HelpDeskSidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userName, setUserName] = useState('Reception');
//   const [userRole, setUserRole] = useState('Help Desk');
//   const { isMicroFeatureEnabled } = useTenant();

//   useEffect(() => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         setUserName(user.full_name_en || user.name || 'Reception');
//         setUserRole(user.role === 'helpdesk' ? 'Help Desk' : 'Reception Desk');
//       } catch (e) {
//         console.error('Failed to parse user', e);
//       }
//     }
//   }, []);

//   // Check which features are enabled
//   const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.DASHBOARD);
//   const isAppointmentsEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.APPOINTMENTS);
//   const isRoomAvailabilityEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.ROOM_AVAILABILITY);
//   const isDoctorSlotsEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.DOCTOR_SLOTS);
//   const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.BILLING);
//   const isNewAdmissionEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.NEW_ADMISSION);

//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   const navItems: NavItem[] = [
//     {
//       icon: LayoutDashboard,
//       label: 'Dashboard',
//       href: '/helpdesk/dashboard',
//       color: 'from-emerald-500 to-emerald-700',
//       isEnabled: isDashboardEnabled,
//     },
//     {
//       icon: Calendar,
//       label: 'Appointments',
//       href: '/helpdesk/appointments',
//       color: 'from-indigo-500 to-indigo-700',
//       isEnabled: isAppointmentsEnabled,
//     },
//     {
//       icon: DoorOpen,
//       label: 'Room Availability',
//       href: '/helpdesk/room-availability',  // ← FIXED: correct path
//       color: 'from-blue-500 to-blue-700',
//       activeCheck: () => pathname === '/helpdesk/room-availability',
//       isEnabled: isRoomAvailabilityEnabled,
//     },
//     {
//       icon: Clock,
//       label: 'Doctor Slots',
//       onClick: onDoctorSlotsClick,
//       href: '/helpdesk/doctor-slots',
//       color: 'from-purple-500 to-purple-700',
//       activeCheck: () => pathname.startsWith('/helpdesk/doctor-slots'),
//       isEnabled: isDoctorSlotsEnabled,
//     },
//     {
//       icon: Receipt,
//       label: 'Billing',
//       onClick: onBillingClick,
//       href: '/helpdesk/billing',
//       color: 'from-amber-500 to-amber-700',
//       activeCheck: () => pathname.startsWith('/helpdesk/billing'),
//       isEnabled: isBillingEnabled,
//     },
//     {
//       icon: Users,
//       label: 'Admission',
//       href: '/helpdesk/admission',
//       color: 'from-teal-500 to-teal-700',
//       isEnabled: isNewAdmissionEnabled,
//     },
//   ];

//   // Filter out disabled items
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

//   return (
//     <aside
//       className={`${
//         isOpen ? 'translate-x-0' : '-translate-x-full'
//       } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
//         isCollapsed ? 'w-20' : 'w-80'
//       } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
//     >
//       {/* Close button for mobile */}
//       <button
//         className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700"
//         onClick={onClose}
//       >
//         <X className="w-5 h-5" />
//       </button>

//       {/* Logo Section */}
//       <div
//         className={`p-6 flex items-center ${
//           isCollapsed ? 'justify-center' : 'justify-between'
//         } border-b border-gray-100 dark:border-gray-800 relative`}
//       >
//         {!isCollapsed ? (
//           <Link href="/helpdesk/dashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Activity className="w-6 h-6" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight">HealthSync</h1>
//               <p className="text-xs text-gray-500 mt-0.5">Help Desk</p>
//             </div>
//           </Link>
//         ) : (
//           <Link href="/helpdesk/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Activity className="w-6 h-6" />
//             </div>
//           </Link>
//         )}

//         {/* Collapse Button */}
//         <button
//           onClick={toggleCollapse}
//           className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors ${
//             isCollapsed
//               ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-sm'
//               : ''
//           }`}
//           title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 flex flex-col min-h-0">
//         <nav className="flex-1 overflow-y-auto px-4 py-8">
//           <div className="mb-6">
//             {!isCollapsed && (
//               <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">
//                 Main Navigation
//               </p>
//             )}
//             <div className="space-y-2">
//               {visibleNavItems.map((item) => {
//                 const active = item.href ? isActive(item.href) : (item.activeCheck?.() ?? false);
//                 const content = (
//                   <>
//                     <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                       <div
//                         className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                           active
//                             ? 'bg-blue-500 text-white'
//                             : `bg-gradient-to-br ${item.color} text-white`
//                         }`}
//                       >
//                         <item.icon className="w-4 h-4" />
//                       </div>
//                       {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                     </div>
//                     {!isCollapsed && item.badge && (
//                       <span
//                         className={`text-xs font-bold px-2 py-1 rounded-full ${
//                           active
//                             ? 'bg-blue-100 text-blue-700'
//                             : 'bg-gray-100 text-gray-600'
//                         }`}
//                       >
//                         {item.badge}
//                       </span>
//                     )}
//                     {isCollapsed && item.badge && (
//                       <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
//                     )}
//                   </>
//                 );

//                 const activeClasses = active
//                   ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-100 shadow-sm'
//                   : 'text-gray-600 hover:bg-gray-50';

//                 if (item.href) {
//                   return (
//                     <Link
//                       key={item.label}
//                       href={item.href}
//                       onClick={handleLinkClick}
//                       className={`flex items-center ${
//                         isCollapsed ? 'justify-center' : 'justify-between gap-4'
//                       } px-4 py-3 rounded-xl transition-all group relative ${activeClasses}`}
//                       title={isCollapsed ? item.label : ''}
//                     >
//                       {content}
//                     </Link>
//                   );
//                 } else {
//                   return (
//                     <button
//                       key={item.label}
//                       onClick={() => {
//                         item.onClick?.();
//                         handleLinkClick();
//                       }}
//                       className={`w-full flex items-center ${
//                         isCollapsed ? 'justify-center' : 'justify-between gap-4'
//                       } px-4 py-3 rounded-xl transition-all group relative text-left ${activeClasses}`}
//                       title={isCollapsed ? item.label : ''}
//                     >
//                       {content}
//                     </button>
//                   );
//                 }
//               })}
//             </div>
//           </div>
//         </nav>

//         {/* User Profile & Logout */}
//         <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//           <div className="p-4">
//             {!isCollapsed ? (
//               <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                     {userName.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold truncate">{userName}</p>
//                     <p className="text-xs text-gray-500 truncate">{userRole}</p>
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
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
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
  LayoutDashboard,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  DoorOpen,
  Clock,
  Receipt,
  LogOut,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { MODULE_KEYS, HELPDESK_FEATURES } from '@/lib/feature';

interface HelpDeskSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onBillingClick: () => void;
  onRoomAvailabilityClick: () => void;
  onDoctorSlotsClick: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  color?: string;
  iconColor?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  activeCheck?: () => boolean;
  isEnabled?: boolean;  // Feature flag
}

export default function HelpDeskSidebar({
  isOpen,
  onClose,
  onBillingClick,
  onRoomAvailabilityClick,
  onDoctorSlotsClick,
}: HelpDeskSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Reception');
  const [userRole, setUserRole] = useState('Help Desk');
  
  // Get tenant data from context
  const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();
  
  // Get tenant name from tenant object
  const tenantName = tenant?.name || "";
  const tenantSlug = tenant?.slug || "";

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.full_name_en || user.name || 'Reception');
        setUserRole(user.role === 'helpdesk' ? 'Help Desk' : 'Reception Desk');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Check which features are enabled
  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.DASHBOARD);
  const isAppointmentsEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.APPOINTMENTS);
  const isRoomAvailabilityEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.ROOM_AVAILABILITY);
  const isDoctorSlotsEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.DOCTOR_SLOTS);
  const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.BILLING);
  const isNewAdmissionEnabled = isMicroFeatureEnabled(MODULE_KEYS.HELPDESK, HELPDESK_FEATURES.NEW_ADMISSION);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/helpdesk/dashboard',
      color: 'from-emerald-500 to-emerald-700',
      isEnabled: isDashboardEnabled,
    },
    {
      icon: Calendar,
      label: 'Appointments',
      href: '/helpdesk/appointments',
      color: 'from-indigo-500 to-indigo-700',
      isEnabled: isAppointmentsEnabled,
    },
    {
      icon: DoorOpen,
      label: 'Room Availability',
      href: '/helpdesk/room-availability',
      color: 'from-blue-500 to-blue-700',
      activeCheck: () => pathname === '/helpdesk/room-availability',
      isEnabled: isRoomAvailabilityEnabled,
    },
    {
      icon: Clock,
      label: 'Doctor Slots',
      onClick: onDoctorSlotsClick,
      href: '/helpdesk/doctor-slots',
      color: 'from-purple-500 to-purple-700',
      activeCheck: () => pathname.startsWith('/helpdesk/doctor-slots'),
      isEnabled: isDoctorSlotsEnabled,
    },
    {
      icon: Receipt,
      label: 'Billing',
      onClick: onBillingClick,
      href: '/helpdesk/billing',
      color: 'from-amber-500 to-amber-700',
      activeCheck: () => pathname.startsWith('/helpdesk/billing'),
      isEnabled: isBillingEnabled,
    },
    {
      icon: Users,
      label: 'Admission',
      href: '/helpdesk/admission',
      color: 'from-teal-500 to-teal-700',
      isEnabled: isNewAdmissionEnabled,
    },
  ];

  // Filter out disabled items
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

  // Show loading state while tenant is being fetched
  if (isTenantLoading) {
    return (
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-80'
        } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
      >
        <div className="p-6 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
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
        isCollapsed ? 'w-20' : 'w-80'
      } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
    >
      {/* Close button for mobile */}
      <button
        className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo Section */}
      <div
        className={`p-6 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } border-b border-gray-100 dark:border-gray-800 relative`}
      >
        {!isCollapsed ? (
          <Link href="/helpdesk/dashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{tenantName || 'HealthSync'}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Help Desk</p>
            </div>
          </Link>
        ) : (
          <Link href="/helpdesk/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
          </Link>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isCollapsed
              ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm'
              : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mb-6">
            {!isCollapsed && (
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">
                Main Navigation
              </p>
            )}
            <div className="space-y-2">
              {visibleNavItems.map((item) => {
                const active = item.href ? isActive(item.href) : (item.activeCheck?.() ?? false);
                const content = (
                  <>
                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                          active
                            ? 'bg-blue-500 text-white'
                            : `bg-gradient-to-br ${item.color} text-white`
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          active
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                    )}
                  </>
                );

                const activeClasses = active
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50';

                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-between gap-4'
                      } px-4 py-3 rounded-xl transition-all group relative ${activeClasses}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      {content}
                    </Link>
                  );
                } else {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.onClick?.();
                        handleLinkClick();
                      }}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-between gap-4'
                      } px-4 py-3 rounded-xl transition-all group relative text-left ${activeClasses}`}
                      title={isCollapsed ? item.label : ''}
                    >
                      {content}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-4">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}