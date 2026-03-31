// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Calendar,
//   Users,
//   CreditCard,
//   ChevronLeft,
//   ChevronRight,
//   User,
//   X,
//   Settings,
//   Activity,
//   DoorOpen,
//   Clock,
//   Receipt,
// } from "lucide-react";

// interface HelpDeskSidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onBillingClick: () => void;
//   onRoomAvailabilityClick: () => void;
//   onDoctorSlotsClick: () => void;
// }

// // Define a proper type for navigation items
// interface NavItem {
//   icon: React.ElementType;
//   label: string;
//   color?: string;
//   iconColor?: string;
//   href?: string; // optional – if present, renders Link, else button
//   onClick?: () => void; // optional – used when no href
//   badge?: string; // optional – for notifications (currently unused)
//   activeCheck?: () => boolean; // optional – custom active detection
// }

// export default function HelpDeskSidebar({
//   isOpen,
//   onClose,
//   onBillingClick,
//   onRoomAvailabilityClick,
//   onDoctorSlotsClick,
// }: HelpDeskSidebarProps) {
//   const pathname = usePathname();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   const toggleCollapse = () => {
//     setIsCollapsed(!isCollapsed);
//   };

//   // Navigation items with proper typing
//   const navItems: NavItem[] = [
//     {
//       icon: LayoutDashboard,
//       label: "Dashboard",
//       href: "/helpdesk/dashboard",
//       color: "from-emerald-500 to-emerald-700",
//       iconColor: "text-emerald-600",
//     },
//     {
//       icon: Calendar,
//       label: "Appointments",
//       href: "/helpdesk/appointments",
//       color: "from-indigo-500 to-indigo-700",
//       iconColor: "text-indigo-600",
//     },
//     {
//       icon: DoorOpen,
//       label: "Room Availability",
//       href: "/admin/bed-management", // new path
//       color: "from-blue-500 to-blue-700",
//       iconColor: "text-blue-600",
//       activeCheck: () => pathname.startsWith("/admin/bed-management"),
//     },
//     {
//       icon: Clock,
//       label: "Doctor Slots",
//       onClick: onDoctorSlotsClick,
//       color: "from-purple-500 to-purple-700",
//       iconColor: "text-purple-600",
//       activeCheck: () => pathname.startsWith("/helpdesk/doctor-slots"),
//     },
//     {
//       icon: Receipt,
//       label: "Billing",
//       onClick: onBillingClick,
//       color: "from-amber-500 to-amber-700",
//       iconColor: "text-amber-600",
//       activeCheck: () => pathname.startsWith("/helpdesk/billing"),
//     },
//     {
//   icon: Users, // or DoorOpen / Activity (your choice)
//   label: "Admission",
//   href: "/helpdesk/admission", // update path if different
//   color: "from-teal-500 to-teal-700",
//   iconColor: "text-teal-600",
// }
//   ];

//   // const quickAccessItems = [
//   //   {
//   //     icon: User,
//   //     label: "New Appointment",
//   //     href: "/helpdesk/appointments/new",
//   //     iconBg: "bg-blue-50 dark:bg-blue-900/30",
//   //     iconColor: "text-blue-600 dark:text-blue-400",
//   //   },
//   // ];

//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) {
//       onClose();
//     }
//   };

//   const isActive = (href: string) => {
//     return pathname === href || pathname.startsWith(href + "/");
//   };

//   return (
//     <aside
//       className={`${
//         isOpen ? "translate-x-0" : "-translate-x-full"
//       } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
//         isCollapsed ? "w-20" : "w-80"
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
//           isCollapsed ? "justify-center" : "justify-between"
//         } border-b border-gray-100 dark:border-gray-800 relative`}
//       >
//         {!isCollapsed ? (
//           <Link
//             href="/helpdesk"
//             className="flex items-center gap-4"
//             onClick={handleLinkClick}
//           >
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
//               <Activity className="w-6 h-6" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight">HealthSync</h1>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">
//                 Help Desk
//               </p>
//             </div>
//           </Link>
//         ) : (
//           <Link
//             href="/helpdesk"
//             className="flex items-center justify-center"
//             onClick={handleLinkClick}
//           >
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
//               ? "absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm"
//               : ""
//           }`}
//           title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {isCollapsed ? (
//             <ChevronRight className="text-gray-600 dark:text-gray-300 w-4 h-4" />
//           ) : (
//             <ChevronLeft className="text-gray-600 dark:text-gray-300 w-4 h-4" />
//           )}
//         </button>
//       </div>

//       {/* Navigation */}
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
//                 // Determine active state
//                 const active = item.href
//                   ? isActive(item.href)
//                   : (item.activeCheck?.() ?? false);

//                 const content = (
//                   <>
//                     <div
//                       className={`flex items-center ${isCollapsed ? "" : "gap-4"}`}
//                     >
//                       <div
//                         className={`w-8 h-8 flex items-center justify-center rounded-lg ${
//                           active
//                             ? "bg-blue-500 text-white"
//                             : `bg-gradient-to-br ${item.color} text-white`
//                         }`}
//                       >
//                         <item.icon className="w-4 h-4" />
//                       </div>
//                       {!isCollapsed && (
//                         <span className="text-sm font-medium">
//                           {item.label}
//                         </span>
//                       )}
//                     </div>
//                     {!isCollapsed && item.badge && (
//                       <span
//                         className={`text-xs font-bold px-2 py-1 rounded-full ${
//                           active
//                             ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
//                             : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
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
//                   ? "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 dark:hover:from-blue-800/40 dark:hover:to-blue-700/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 shadow-sm"
//                   : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50";

//                 if (item.href) {
//                   return (
//                     <Link
//                       key={item.label}
//                       href={item.href}
//                       onClick={handleLinkClick}
//                       className={`flex items-center ${
//                         isCollapsed ? "justify-center" : "justify-between gap-4"
//                       } px-4 py-3 rounded-xl transition-all group relative ${activeClasses}`}
//                       title={isCollapsed ? item.label : ""}
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
//                         isCollapsed ? "justify-center" : "justify-between gap-4"
//                       } px-4 py-3 rounded-xl transition-all group relative text-left ${activeClasses}`}
//                       title={isCollapsed ? item.label : ""}
//                     >
//                       {content}
//                     </button>
//                   );
//                 }
//               })}
//             </div>
//           </div>

//           {/* Quick Access */}
//           {/* {!isCollapsed && (
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
//                     <div
//                       className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}
//                     >
//                       <item.icon className="w-4 h-4" />
//                     </div>
//                     <span className="text-sm font-medium">{item.label}</span>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           )} */}

//           {/* Quick Access Icons Only (when collapsed) */}
//           {/* {isCollapsed && (
//             <div className="pt-8 space-y-2">
//               {quickAccessItems.map((item) => (
//                 <Link
//                   key={item.label}
//                   href={item.href}
//                   onClick={handleLinkClick}
//                   className="flex items-center justify-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative"
//                   title={item.label}
//                 >
//                   <div
//                     className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}
//                   >
//                     <item.icon className="w-4 h-4" />
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )} */}
//         </nav>

//         {/* User Profile Section */}
//         <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
//           <div className="p-4">
//             <Link
//               href="/helpdesk/profile"
//               className={`flex items-center ${
//                 isCollapsed ? "justify-center" : "gap-3"
//               } p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group`}
//               onClick={handleLinkClick}
//               title={isCollapsed ? "Jane Doe - Reception Desk" : ""}
//             >
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
//                 JD
//               </div>
//               {!isCollapsed && (
//                 <>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold truncate">Jane Doe</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                       Reception Desk
//                     </p>
//                   </div>
//                   <div className="p-1 rounded-lg bg-white dark:bg-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-600">
//                     <Settings className="w-3 h-3 text-gray-400" />
//                   </div>
//                 </>
//               )}
//             </Link>
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

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/helpdesk/dashboard',
      color: 'from-emerald-500 to-emerald-700',
    },
    {
      icon: Calendar,
      label: 'Appointments',
      href: '/helpdesk/appointments',
      color: 'from-indigo-500 to-indigo-700',
    },
    {
      icon: DoorOpen,
      label: 'Room Availability',
      href: '/admin/bed-management',
      color: 'from-blue-500 to-blue-700',
      activeCheck: () => pathname.startsWith('/admin/bed-management'),
    },
    {
      icon: Clock,
      label: 'Doctor Slots',
      onClick: onDoctorSlotsClick,
      color: 'from-purple-500 to-purple-700',
      activeCheck: () => pathname.startsWith('/helpdesk/doctor-slots'),
    },
    {
      icon: Receipt,
      label: 'Billing',
      onClick: onBillingClick,
      color: 'from-amber-500 to-amber-700',
      activeCheck: () => pathname.startsWith('/helpdesk/billing'),
    },
    {
      icon: Users,
      label: 'Admission',
      href: '/helpdesk/admission',
      color: 'from-teal-500 to-teal-700',
    },
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
      } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen pb-4 lg:pb-0`}
    >
      {/* Close button for mobile */}
      <button
        className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700"
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
          <Link href="/helpdesk" className="flex items-center gap-4" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HealthSync</h1>
              <p className="text-xs text-gray-500 mt-0.5">Help Desk</p>
            </div>
          </Link>
        ) : (
          <Link href="/helpdesk" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
          </Link>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors ${
            isCollapsed
              ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-sm'
              : ''
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
              {navItems.map((item) => {
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
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </>
                );

                const activeClasses = active
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50';

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
              // Expanded view: profile and logout on the same row
              <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userRole}</p>
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
              // Collapsed view: avatar centered, logout icon below
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
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
          </div>
        </div>
      </div>
    </aside>
  );
}