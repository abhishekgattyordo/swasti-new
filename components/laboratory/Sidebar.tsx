

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// const menuItems = [
//   { name: "Dashboard", path: "/laboratory", icon: "📊" },
//   { name: "Test Catalog", path: "/laboratory/tests", icon: "🔬" },
//   { name: "Lab Orders", path: "/laboratory/orders", icon: "📋" },
//   { name: "Sample Collection", path: "/laboratory/samples", icon: "🧪" },
//   { name: "Reports", path: "/laboratory/reports", icon: "📄" },
// ];

// interface LabSidebarProps {
//   collapsed: boolean;
//   onToggle: () => void;
// }

// export function LabSidebar({ collapsed, onToggle }: LabSidebarProps) {
//   const pathname = usePathname();

//   return (
//     <>
//       {/* Mobile overlay */}
//       {!collapsed && (
//         <div 
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={onToggle}
//         />
//       )}
      
//       {/* Sidebar */}
//       <div 
//         className={`
//           fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
//           transition-all duration-300 z-50 flex flex-col shadow-lg
//           ${collapsed ? 'w-20' : 'w-72'}
//         `}
//       >
//         {/* Logo Section with Toggle Button */}
//         <div className={`p-6 border-b border-gray-100 ${collapsed ? 'px-3' : ''}`}>
//           <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
//             {!collapsed && (
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
//                   <span className="text-white text-lg">🔬</span>
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-bold text-gray-900">Lab Module</h1>
//                   <p className="text-xs text-gray-500">Clinical System</p>
//                 </div>
//               </div>
//             )}
//             {collapsed && (
//               <div className="flex items-center justify-center w-full">
//                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//                   <span className="text-white text-lg">🔬</span>
//                 </div>
//               </div>
//             )}
//             <button
//               onClick={onToggle}
//               className={`
//                 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0
//                 ${collapsed ? 'absolute -right-3 top-8 bg-white border border-gray-200 shadow-md' : ''}
//               `}
//               title={collapsed ? "Expand" : "Collapse"}
//             >
//               <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 {collapsed ? (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
//                 ) : (
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
//                 )}
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto py-6">
//           <div className={`space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
//             {menuItems.map((item) => {
//               const isActive = pathname === item.path;
//               return (
//                 <Link
//                   key={item.path}
//                   href={item.path}
//                   className={`
//                     flex items-center rounded-lg transition-all duration-200 group
//                     ${collapsed ? 'justify-center py-3' : 'px-4 py-3'}
//                     ${isActive 
//                       ? 'bg-primary/10 text-primary' 
//                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                     }
//                   `}
//                   title={collapsed ? item.name : ""}
//                 >
//                   <span className={`text-xl ${!collapsed && 'mr-3'} ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
//                     {item.icon}
//                   </span>
//                   {!collapsed && (
//                     <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
//                       {item.name}
//                     </span>
//                   )}
//                   {isActive && !collapsed && (
//                     <div className="ml-auto w-1 h-6 bg-primary rounded-full"></div>
//                   )}
//                 </Link>
//               );
//             })}
//           </div>
//         </nav>

//         {/* Footer */}
//         {!collapsed && (
//           <div className="p-6 border-t border-gray-200">
//             <div className="bg-gray-50 rounded-lg p-3">
//               <div className="flex items-center space-x-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <p className="text-xs text-gray-600">System Active</p>
//               </div>
//               <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
//             </div>
//           </div>
//         )}
        
//         {collapsed && (
//           <div className="p-4 border-t border-gray-200">
//             <div className="flex justify-center">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, LABORATORY_FEATURES } from "@/lib/feature";
import { LogOut } from 'lucide-react';

const menuItems = [
  { name: "Dashboard", path: "/laboratory", icon: "📊", feature: "DASHBOARD" },
  { name: "Test Catalog", path: "/laboratory/tests", icon: "🔬", feature: "TEST_CATALOG" },
  { name: "Lab Orders", path: "/laboratory/orders", icon: "📋", feature: "LAB_ORDERS" },
  { name: "Sample Collection", path: "/laboratory/samples", icon: "🧪", feature: "SAMPLE_COLLECTION" },
  { name: "Reports", path: "/laboratory/reports", icon: "📄", feature: "REPORTS" },
];

interface LabSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function LabSidebar({ collapsed, onToggle, isOpen, onClose }: LabSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Lab Technician');
  const [userRole, setUserRole] = useState('Lab Staff');
  
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
        setUserName(user.full_name_en || user.name || 'Lab Technician');
        setUserRole(user.role === 'laboratory' ? 'Lab Admin' : 'Lab Staff');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Check which features are enabled
  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.LABORATORY, LABORATORY_FEATURES.DASHBOARD);
  const isTestCatalogEnabled = isMicroFeatureEnabled(MODULE_KEYS.LABORATORY, LABORATORY_FEATURES.TEST_CATALOG);
  const isLabOrdersEnabled = isMicroFeatureEnabled(MODULE_KEYS.LABORATORY, LABORATORY_FEATURES.LAB_ORDERS);
  const isSampleCollectionEnabled = isMicroFeatureEnabled(MODULE_KEYS.LABORATORY, LABORATORY_FEATURES.SAMPLE_COLLECTION);
  const isReportsEnabled = isMicroFeatureEnabled(MODULE_KEYS.LABORATORY, LABORATORY_FEATURES.REPORTS);

  // Filter menu items based on feature flags
  const visibleMenuItems = menuItems.filter(item => {
    switch(item.feature) {
      case "DASHBOARD":
        return isDashboardEnabled;
      case "TEST_CATALOG":
        return isTestCatalogEnabled;
      case "LAB_ORDERS":
        return isLabOrdersEnabled;
      case "SAMPLE_COLLECTION":
        return isSampleCollectionEnabled;
      case "REPORTS":
        return isReportsEnabled;
      default:
        return true;
    }
  });

  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (window.innerWidth < 1024 && onClose) onClose();
    router.push('/login');
  };

  // Show loading state while tenant is being fetched
  if (isTenantLoading) {
    return (
      <>
        {/* Mobile overlay */}
        {!collapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`
            fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
            transition-all duration-300 z-50 flex flex-col shadow-lg
            ${collapsed ? 'w-20' : 'w-72'}
          `}
        >
          {/* Logo Section with Loading Skeleton */}
          <div className={`p-6 border-b border-gray-100 ${collapsed ? 'px-3' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                    <span className="text-gray-400 text-lg">🔬</span>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              )}
              {collapsed && (
                <div className="flex items-center justify-center w-full">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                    <span className="text-gray-400 text-lg">🔬</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 z-50 flex flex-col shadow-lg
          ${collapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Logo Section with Toggle Button */}
        <div className={`p-6 border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'px-3' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <Link href="/laboratory" className="flex items-center space-x-2" onClick={handleLinkClick}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">🔬</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{tenantName || 'Lab Module'}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Clinical System</p>
                </div>
              </Link>
            )}
            {collapsed && (
              <Link href="/laboratory" className="flex items-center justify-center w-full" onClick={handleLinkClick}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🔬</span>
                </div>
              </Link>
            )}
            <button
              onClick={onToggle}
              className={`
                p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0
                ${collapsed ? 'absolute -right-3 top-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md' : ''}
              `}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className={`space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center rounded-lg transition-all duration-200 group
                    ${collapsed ? 'justify-center py-3' : 'px-4 py-3'}
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  title={collapsed ? item.name : ""}
                >
                  <span className={`text-xl ${!collapsed && 'mr-3'} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                      {item.name}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout Section */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800">
          <div className="p-4">
            {!collapsed ? (
              // Expanded view: profile and logout on the same row
              <div className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate dark:text-white">{userName}</p>
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
              // Collapsed view: avatar centered, logout icon below
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
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
            {!collapsed && (
              <div className="mt-3 px-2">
                <p className="text-[8px] text-gray-400 dark:text-gray-500">Laboratory v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}