

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
//   isEnabled?: boolean;  // Feature flag
// }

// export default function HelpDeskSidebar({
//   isOpen,
//   onClose,
//   onBillingClick,
//   onDoctorSlotsClick,
// }: HelpDeskSidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userName, setUserName] = useState('Reception');
//   const [userRole, setUserRole] = useState('Help Desk');
  
//   // Get tenant data from context
//   const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();
  
//   // Get tenant name from tenant object
//   const tenantName = tenant?.name || "";
 

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
//       href: '/helpdesk/room-availability',
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

//   // Show loading state while tenant is being fetched
//   if (isTenantLoading) {
//     return (
//       <aside
//         className={`${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
//           isCollapsed ? 'w-20' : 'w-80'
//         } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
//       >
//         <div className="p-6 flex items-center justify-center">
//           <div className="animate-pulse flex space-x-4">
//             <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
//             {!isCollapsed && (
//               <div className="flex-1 space-y-2 py-1">
//                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
//                 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
//               </div>
//             )}
//           </div>
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
//       } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
//     >
//       {/* Close button for mobile */}
//       <button
//         className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
//               <h1 className="text-xl font-bold tracking-tight">{tenantName || 'HealthSync'}</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Help Desk</p>
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
//           className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
//             isCollapsed
//               ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm'
//               : ''
//           }`}
//           title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
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
//                             ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
//                             : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//                         }`}
//                       >
//                         {item.badge}
//                       </span>
//                     )}
//                     {isCollapsed && item.badge && (
//                       <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
//                     )}
//                   </>
//                 );

//                 const activeClasses = active
//                   ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm'
//                   : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50';

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
//                     <p className="text-sm font-semibold truncate dark:text-white">{userName}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userRole}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleLogout}
//                   className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
//                   className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
import { useTenant } from '@/context/TenantContext';
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
  isEnabled?: boolean;
}

export default function HelpDeskSidebar({
  isOpen,
  onClose,
  onBillingClick,
  onDoctorSlotsClick,
}: HelpDeskSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Reception');
  const [userRole, setUserRole] = useState('Help Desk');
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const { tenant, isLoading: isTenantLoading, isMicroFeatureEnabled } = useTenant();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const rawName = user.full_name_en || user.name || 'Reception';
        setUserName(capitalizeName(rawName));
        setUserRole(user.role === 'helpdesk' ? 'Help Desk' : 'Reception Desk');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const capitalizeName = (name: string) => {
    if (!name) return 'Reception';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

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
      isEnabled: isDashboardEnabled,
    },
    {
      icon: Calendar,
      label: 'Appointments',
      href: '/helpdesk/appointments',
      isEnabled: isAppointmentsEnabled,
    },
    {
      icon: DoorOpen,
      label: 'Room Availability',
      href: '/helpdesk/room-availability',
      activeCheck: () => pathname === '/helpdesk/room-availability',
      isEnabled: isRoomAvailabilityEnabled,
    },
    {
      icon: Clock,
      label: 'Doctor Slots',
      onClick: onDoctorSlotsClick,
      href: '/helpdesk/doctor-slots',
      activeCheck: () => pathname.startsWith('/helpdesk/doctor-slots'),
      isEnabled: isDoctorSlotsEnabled,
    },
    {
      icon: Receipt,
      label: 'Billing',
      onClick: onBillingClick,
      href: '/helpdesk/billing',
      activeCheck: () => pathname.startsWith('/helpdesk/billing'),
      isEnabled: isBillingEnabled,
    },
    {
      icon: Users,
      label: 'Admission',
      href: '/helpdesk/admission',
      isEnabled: isNewAdmissionEnabled,
    },
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
        } flex-shrink-0 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
      >
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-[#E2EFEA] relative`}>
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EAF7F4] rounded-xl flex items-center justify-center animate-pulse">
                <Activity className="text-2xl text-[#2BB2A7]" />
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
                <Activity className="text-2xl text-[#2BB2A7]" />
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
                    Admin Module
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
            <div className="mb-4">
              {!isCollapsed && (
                <p className="text-[10px] font-medium text-[#1F8F89] uppercase tracking-wider px-3 mb-2">
                 
                </p>
              )}
              <div className="space-y-1">
                {visibleNavItems.map((item) => {
                  const active = item.href ? isActive(item.href) : (item.activeCheck?.() ?? false);
                  return (
                    <div 
                      key={item.label} 
                      className="relative"
                      onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.href ? (
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
                      ) : (
                        <button
                          onClick={() => {
                            item.onClick?.();
                            handleLinkClick();
                          }}
                          className={`w-full flex items-center ${
                            isCollapsed ? 'justify-center' : 'justify-between gap-3'
                          } px-3 py-2 rounded-lg transition-all text-left ${
                            active
                              ? 'bg-[#EAF7F4] text-[#1A1A1A] font-semibold'
                              : 'text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]'
                          }`}
                          title={isCollapsed ? item.label : ''}
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
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
                        {userRole}
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
                    Help Desk Portal v1.0.0
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