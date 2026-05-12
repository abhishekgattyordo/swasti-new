

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", path: "/laboratory", icon: "📊" },
  { name: "Test Catalog", path: "/laboratory/tests", icon: "🔬" },
  { name: "Lab Orders", path: "/laboratory/orders", icon: "📋" },
  { name: "X-Ray", path: "/laboratory/xray", icon: "🩻" },
  { name: "MRI Scan", path: "/laboratory/mri", icon: "🧠" },
  { name: "Sample Collection", path: "/laboratory/samples", icon: "🧪" },
  { name: "Reports", path: "/laboratory/reports", icon: "📄" },
];

interface LabSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function LabSidebar({ collapsed, onToggle }: LabSidebarProps) {
  const pathname = usePathname();

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
        {/* Logo Section with Toggle Button */}
        <div className={`p-6 border-b border-gray-100 ${collapsed ? 'px-3' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">🔬</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Lab Module</h1>
                  <p className="text-xs text-gray-500">Clinical System</p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🔬</span>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className={`
                p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0
                ${collapsed ? 'absolute -right-3 top-8 bg-white border border-gray-200 shadow-md' : ''}
              `}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center rounded-lg transition-all duration-200 group
                    ${collapsed ? 'justify-center py-3' : 'px-4 py-3'}
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={collapsed ? item.name : ""}
                >
                  <span className={`text-xl ${!collapsed && 'mr-3'} ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                      {item.name}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1 h-6 bg-primary rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-gray-600">System Active</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}