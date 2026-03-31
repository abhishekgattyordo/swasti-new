// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { usePathname,useRouter } from 'next/navigation';
// import {
//   HealthAndSafety,
//   Dashboard,
//   MedicalServices,
//   PersonalInjury,
//   Domain,
//   Settings,
//   UnfoldMore,
//   People,
//   Person,
//   AssignmentInd,
//   CalendarMonth,
//   ReceiptLong,
//   Medication,
//   ChevronLeft,
//   ChevronRight,
//   Hotel, 
//    Logout, 
// } from '@mui/icons-material';

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function Sidebar({ isOpen, onClose }: SidebarProps) {
//   const pathname = usePathname();
//    const router = useRouter();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const toggleCollapse = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   // Navigation items with routes
//   const navItems = [
//     { 
//       icon: Dashboard, 
//       label: 'Dashboard', 
//       href: '/admin/healthcaredashboard',
//       color: 'from-blue-500 to-blue-700',
//       iconColor: 'text-blue-600'
//     },
//     { 
//       icon: People, 
//       label: 'Doctors', 
//       href: '/admin/doctorstaffmanagement',
//       badge: 3,
//       color: 'from-emerald-500 to-emerald-700',
//       iconColor: 'text-emerald-600'
//     },
//     { 
//       icon: Person, 
//       label: 'Patients', 
//       href: '/admin/patientmanagement',
//       badge: 8,
//       color: 'from-purple-500 to-purple-700',
//       iconColor: 'text-purple-600'
//     },
//       { 
//       icon: Domain, 
//       label: 'Bed Management', 
//       href: '/admin/bed-management',
//       color: 'from-amber-500 to-amber-700',
//       iconColor: 'text-amber-600'
//     },
//       { 
//     icon: Hotel,                // or SingleBed, KingBed, etc.
//     label: 'Bed Configuration', 
//     href: '/admin/bed-configuration',   // adjust to your actual route
//     color: 'from-indigo-500 to-indigo-700',
//     iconColor: 'text-indigo-600'
//   },
//   ];

//   const quickAccessItems = [
//     {
//       icon: Person,
//       label: 'Add New Patient',
//       href: '/admin/addnewpatient',
//       iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
//       iconColor: 'text-emerald-600 dark:text-emerald-400'
//     },
//     {
//       icon: People,
//       label: 'Add New Doctor',
//       href: '/admin/addnewdoctor',
//       iconBg: 'bg-blue-50 dark:bg-blue-900/30',
//       iconColor: 'text-blue-600 dark:text-blue-400'
//     },
   
//   ];

//   // Function to handle link click (for mobile)
//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) {
//       onClose();
//     }
//   };

//   const handleLogout = () => {
//     // Clear all auth-related data from localStorage
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('user');
//     // Close sidebar on mobile
//     if (window.innerWidth < 1024) {
//       onClose();
//     }
//     // Redirect to login page
//     router.push('/login');
//   };

//   // Check if a link is active
//   const isActive = (href: string) => {
//     return pathname === href || pathname.startsWith(href + '/');
//   };

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
//           <Link 
//             href="/admin/healthcaredashboard" 
//             className="flex items-center gap-4"
//             onClick={handleLinkClick}
//           >
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <HealthAndSafety className="text-2xl" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight">HealthSync</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">
//                 Multi-Facility Management System
//               </p>
//             </div>
//           </Link>
//         ) : (
//           <Link 
//             href="/admin/healthcaredashboard" 
//             className="flex items-center justify-center"
//             onClick={handleLinkClick}
//           >
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <HealthAndSafety className="text-2xl" />
//             </div>
//           </Link>
//         )}
        
//         {/* Collapse Button - Only visible on desktop */}
//         <button
//           onClick={toggleCollapse}
//           className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
//             isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
//           }`}
//           title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {isCollapsed ? (
//             <ChevronRight className="text-gray-600 dark:text-gray-300 text-lg" />
//           ) : (
//             <ChevronLeft className="text-gray-600 dark:text-gray-300 text-lg" />
//           )}
//         </button>
//       </div>

//       {/* Navigation - Fixed height with scrollable content */}
//       <div className="flex-1 flex flex-col min-h-0">
//         <nav className="flex-1 overflow-y-auto px-4 py-8">
//           {/* Main Navigation */}
//           <div className="mb-6">
//             {!isCollapsed && (
//               <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-3">
//                 Main Navigation
//               </p>
//             )}
//             <div className="space-y-2">
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
//                         ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm' 
//                         : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
//                     }`}
//                     title={isCollapsed ? item.label : ''}
//                   >
//                     <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
//                       <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                         active 
//                           ? 'bg-blue-500 text-white' 
//                           : `bg-gradient-to-br ${item.color} text-white`
//                       }`}>
//                         <item.icon className="text-lg" />
//                       </div>
//                       {!isCollapsed && (
//                         <span className="text-sm font-medium">{item.label}</span>
//                       )}
//                     </div>
//                     {!isCollapsed && item.badge && (
//                       <span className={`text-xs font-bold px-2 py-1 rounded-full ${
//                         active 
//                           ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
//                           : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
//                       }`}>
//                         {item.badge}
//                       </span>
//                     )}
                    
//                     {/* Show badge as dot when collapsed */}
//                     {isCollapsed && item.badge && (
//                       <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
//                     )}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Quick Access */}
//           {!isCollapsed && (
//             <div className="pt-8">
//               <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-3">
//                 Quick Access
//               </p>
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
          
//           {/* Quick Access Icons Only (when collapsed) */}
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

//         {/* User Profile Section - Fixed at bottom */}
//         <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//           <div className="p-4">
//             <Link 
//               href="/admin/profile" 
//               className={`flex items-center ${
//                 isCollapsed ? 'justify-center' : 'gap-3'
//               } p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group`}
//               onClick={handleLinkClick}
//               title={isCollapsed ? "Alex Rivera - System Administrator" : ""}
//             >
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                 AR
//               </div>
//               {!isCollapsed && (
//                 <>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold truncate">Alex Rivera</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">System Administrator</p>
//                   </div>
//                   <div className="p-1 rounded-lg bg-white dark:bg-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-600">
//                     <UnfoldMore className="text-gray-400 text-sm" />
//                   </div>
//                 </>
//               )}
//             </Link>

//              <button
//               onClick={handleLogout}
//               className={`flex items-center ${
//                 isCollapsed ? 'justify-center' : 'gap-3'
//               } w-full p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer`}
//               title={isCollapsed ? "Logout" : ""}
//             >
//               <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600">
//                 <Logout className="text-xl" />
//               </div>
//               {!isCollapsed && (
//                 <span className="text-sm font-medium">Logout</span>
//               )}
//             </button>
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
} from '@mui/icons-material';

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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.full_name_en || user.name || 'Admin');
        setUserRole(user.role === 'admin' ? 'System Administrator' : 'Administrator');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { icon: Dashboard, label: 'Dashboard', href: '/admin/healthcaredashboard', color: 'from-blue-500 to-blue-700' },
    { icon: People, label: 'Doctors', href: '/admin/doctorstaffmanagement', badge: 3, color: 'from-emerald-500 to-emerald-700' },
    { icon: Person, label: 'Patients', href: '/admin/patientmanagement', badge: 8, color: 'from-purple-500 to-purple-700' },
    { icon: Domain, label: 'Bed Management', href: '/admin/bed-management', color: 'from-amber-500 to-amber-700' },
    { icon: Hotel, label: 'Bed Configuration', href: '/admin/bed-configuration', color: 'from-indigo-500 to-indigo-700' },
  ];

  const quickAccessItems = [
    { icon: Person, label: 'Add New Patient', href: '/admin/addnewpatient', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: People, label: 'Add New Doctor', href: '/admin/addnewdoctor', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
        isCollapsed ? 'w-20' : 'w-80'
      } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
    >
      {/* Close button for mobile */}
      <button
        className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
        {!isCollapsed ? (
          <Link href="/admin/healthcaredashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <HealthAndSafety className="text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HealthSync</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Multi-Facility Management System</p>
            </div>
          </Link>
        ) : (
          <Link href="/admin/healthcaredashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <HealthAndSafety className="text-2xl" />
            </div>
          </Link>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
          }`}
        >
          {isCollapsed ? <ChevronRight className="text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="text-gray-600 dark:text-gray-300" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mb-6">
            {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Main Navigation</p>}
            <div className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-4'} px-4 py-3 rounded-xl transition-all group relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        active ? 'bg-blue-500 text-white' : `bg-gradient-to-br ${item.color} text-white`
                      }`}>
                        <item.icon className="text-lg" />
                      </div>
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {!isCollapsed && (
            <div className="pt-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Quick Access</p>
              <div className="space-y-2">
                {quickAccessItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                      <item.icon className="text-lg" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="pt-8 space-y-2">
              {quickAccessItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative"
                  title={item.label}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                    <item.icon className="text-lg" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* User Info (non‑clickable) + Logout icon */}
       <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
  <div className="p-4">
    {!isCollapsed ? (
      // Expanded view: profile and logout on the same row
      <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Logout"
        >
          <Logout className="text-2xl" />
        </button>
      </div>
    ) : (
      // Collapsed view: avatar centered, logout icon below
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Logout"
        >
          <Logout className="text-2xl" />
        </button>
      </div>
    )}
  </div>
</div>
      </div>
    </aside>
  );
}

