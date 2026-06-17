// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   LayoutDashboard,
//   ClipboardList,
//   FileEdit,
//   Plus,
//   Stethoscope,
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Activity,
//   UserCircle,
//   Clock,
// } from 'lucide-react';

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface NavItem {
//   icon: React.ElementType;
//   label: string;
//   href: string;
//   badge?: number;
//   color: string;
// }

// export default function EmergencySidebar({ isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [userName, setUserName] = useState('Doctor');
//   const [userRole, setUserRole] = useState('Emergency Duty Doctor');

//   useEffect(() => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         setUserName(user.full_name_en || user.name || 'Doctor');
//         setUserRole(user.role === 'head-er' ? 'Head of Emergency' : 'Emergency Duty Doctor');
//       } catch (e) {
//         console.error('Failed to parse user', e);
//       }
//     }
//   }, []);

//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   const navItems: NavItem[] = [
//     { 
//       icon: LayoutDashboard, 
//       label: 'Dashboard', 
//       href: '/emergency/dashboard', 
//       color: 'from-blue-500 to-blue-700' 
//     },
//     { 
//       icon: ClipboardList, 
//       label: 'Assessments', 
//       href: '/emergency/assessments', 
//       color: 'from-emerald-500 to-emerald-700' 
//     },
//     { 
//       icon: FileEdit, 
//       label: 'Drafts', 
//       href: '/emergency/drafts', 
//       color: 'from-amber-500 to-amber-700' 
//     },
//     { 
//       icon: Activity, 
//       label: 'Vitals Monitor', 
//       href: '/emergency/vitals', 
//       color: 'from-cyan-500 to-cyan-700' 
//     },
//     { 
//       icon: Plus, 
//       label: 'New Assessment', 
//       href: '/emergency/assessments/new', 
//       color: 'from-purple-500 to-purple-700' 
//     },
//     { 
//       icon: Clock, 
//       label: 'Shift Handover', 
//       href: '/emergency/handover', 
//       color: 'from-indigo-500 to-indigo-700' 
//     },
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

//   const isActive = (href: string) => {
//     if (href === '/emergency') {
//       return pathname === href;
//     }
//     return pathname === href || pathname?.startsWith(href + '/');
//   };

//   return (
//     <>
//       {/* Mobile menu button - OUTSIDE the aside */}
//       <button
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
//         onClick={() => onClose()}
//       >
//         <Stethoscope className="w-5 h-5 text-red-600" />
//       </button>

//       <aside
//         className={`${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 ${
//           isCollapsed ? 'w-24' : 'w-80'
//         } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
//       >
//         {/* Close button for mobile */}
//         <button
//           className="lg:hidden absolute top-6 right-6 z-50 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//           onClick={onClose}
//         >
//           <X className="w-5 h-5" />
//         </button>

//         {/* Logo Section */}
//         <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
//           {!isCollapsed ? (
//             <Link href="/emergency" className="flex items-center gap-3" onClick={handleLinkClick}>
//               <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//                 <Stethoscope className="w-5 h-5" />
//               </div>
//               <div>
//                 <h1 className="text-lg font-bold tracking-tight">ER Pre-Admission</h1>
//                 <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">Emergency Ward</p>
//               </div>
//             </Link>
//           ) : (
//             <Link href="/emergency" className="flex items-center justify-center" onClick={handleLinkClick}>
//               <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//                 <Stethoscope className="w-5 h-5" />
//               </div>
//             </Link>
//           )}

//           {/* Collapse Button */}
//           <button
//             onClick={toggleCollapse}
//             className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50 ${
//               isCollapsed 
//                 ? 'absolute -right-3.5 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' 
//                 : ''
//             }`}
//             title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//           >
//             {isCollapsed ? (
//               <ChevronRight className="text-gray-600 dark:text-gray-300 text-base" />
//             ) : (
//               <ChevronLeft className="text-gray-600 dark:text-gray-300 text-base" />
//             )}
//           </button>
//         </div>

//         {/* Navigation Section */}
//         <div className="flex-1 flex flex-col min-h-0">
//           <nav className="flex-1 overflow-y-auto px-3 py-6">
//             <div className="mb-6">
//               {!isCollapsed && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">Emergency Workflow</p>}
//               <div className="space-y-1">
//                 {navItems.map((item) => {
//                   const active = isActive(item.href);
//                   return (
//                     <Link
//                       key={item.label}
//                       href={item.href}
//                       onClick={handleLinkClick}
//                       className={`flex items-center ${
//                         isCollapsed ? 'justify-center' : 'justify-between gap-3'
//                       } px-3 py-2.5 rounded-lg transition-all group relative ${
//                         active
//                           ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-800/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/30 shadow-sm'
//                           : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
//                       }`}
//                       title={isCollapsed ? item.label : ''}
//                     >
//                       <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
//                         <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                           active ? 'bg-red-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
//                         }`}>
//                           <item.icon className="w-4 h-4" />
//                         </div>
//                         {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
//                       </div>
//                       {!isCollapsed && item.badge && (
//                         <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
//                           active ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//                         }`}>
//                           {item.badge}
//                         </span>
//                       )}
//                       {isCollapsed && item.badge && (
//                         <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
//                       )}
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           </nav>

//           {/* User Profile & Logout Section */}
//           <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//             <div className="p-4">
//               {!isCollapsed ? (
//                 <div className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold text-sm">
//                       {userName.charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-semibold truncate">{userName}</p>
//                       <p className="text-sm text-gray-500 truncate">{userRole}</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleLogout}
//                     className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
//                     title="Logout"
//                   >
//                     <LogOut className="w-5 h-5" />
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-semibold text-sm">
//                     {userName.charAt(0).toUpperCase()}
//                   </div>
//                   <button
//                     onClick={handleLogout}
//                     className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
//                     title="Logout"
//                   >
//                     <LogOut className="w-5 h-5" />
//                   </button>
//                 </div>
//               )}
//               {!isCollapsed && (
//                 <div className="mt-3 px-2">
//                   <p className="text-[8px] text-gray-400">Emergency Ward v1.0.0</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }




'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FileEdit,
  Plus,
  Stethoscope,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  UserCircle,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function EmergencySidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Doctor');
  const [userRole, setUserRole] = useState('Emergency Duty Doctor');
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const rawName = user.full_name_en || user.name || 'Doctor';
        setUserName(capitalizeName(rawName));
        setUserRole(user.role === 'head-er' ? 'Head of Emergency' : 'Emergency Duty Doctor');
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

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/emergency/dashboard' },
    { icon: ClipboardList, label: 'Assessments', href: '/emergency/assessments' },
    { icon: FileEdit, label: 'Drafts', href: '/emergency/drafts' },
    { icon: Activity, label: 'Vitals Monitor', href: '/emergency/vitals' },
    { icon: Plus, label: 'New Assessment', href: '/emergency/assessments/new' },
    { icon: Clock, label: 'Shift Handover', href: '/emergency/handover' },
  ];

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

  const isActive = (href: string) => {
    if (href === '/emergency') {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

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

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#F4F9F7] dark:bg-gray-800 rounded-lg shadow-md border border-[#E2EFEA] dark:border-gray-700"
        onClick={() => onClose()}
      >
        <Stethoscope className="w-5 h-5 text-[#2BB2A7]" />
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 ${
          isCollapsed ? 'w-24' : 'w-80'
        } flex-shrink-0 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-6 right-6 z-50 p-2 text-[#4A6B66] hover:text-[#2BB2A7] transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section - Left aligned with Text Below */}
        <div className={`px-4 py-1 flex flex-col items-start border-b border-[#E2EFEA] relative`}>
          <Link href="/emergency" className="flex items-center gap-3 w-full" onClick={handleLinkClick}>
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
                  Emergency Module
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

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <div className="mb-4">
              {!isCollapsed && (
                <p className="text-[10px] font-medium text-[#1F8F89] uppercase tracking-wider px-3 mb-2">
                  Emergency Workflow
                </p>
              )}
              <div className="space-y-1">
                {navItems.map((item) => {
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
          </nav>

          {/* User Profile & Logout Section */}
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
                    Emergency Portal v1.0.0
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