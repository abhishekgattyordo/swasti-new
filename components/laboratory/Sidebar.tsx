"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Microscope,
  ClipboardList,
  Activity,
  Brain,
  FlaskRound,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';

interface LabSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function LabSidebar({ collapsed, onToggle, isOpen = false, onClose = () => {} }: LabSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Lab Technician');
  const [userRole, setUserRole] = useState('Lab Technician');
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const rawName = user.full_name_en || user.name || 'Lab Technician';
        setUserName(capitalizeName(rawName));
        setUserRole(user.role === 'lab' ? 'Lab Manager' : 'Lab Technician');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const capitalizeName = (name: string) => {
    if (!name) return 'Lab Technician';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const menuItems = [
    { icon: LayoutDashboard, name: "Dashboard", path: "/laboratory" },
    { icon: Microscope, name: "Test Catalog", path: "/laboratory/tests" },
    { icon: ClipboardList, name: "Lab Orders", path: "/laboratory/orders" },
    { icon: Activity, name: "X-Ray", path: "/laboratory/xray" },
    { icon: Brain, name: "MRI Scan", path: "/laboratory/mri" },
    { icon: FlaskRound, name: "Sample Collection", path: "/laboratory/samples" },
    { icon: FileText, name: "Reports", path: "/laboratory/reports" },
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

  const isActive = (path: string) => {
    if (path === '/laboratory') {
      return pathname === path;
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, label: string) => {
    if (collapsed) {
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
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-[#F4F9F7] dark:bg-gray-900 border-r border-[#E2EFEA] dark:border-gray-800
          transition-all duration-300 z-50 flex flex-col shadow-lg
          ${collapsed ? 'w-24' : 'w-80'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-6 right-6 p-2 text-[#4A6B66] hover:text-[#2BB2A7] dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section - Left aligned with increased size */}
      <div className="px-2 py-3 border-b border-[#E2EFEA] relative">
  <Link
    href="/laboratory"
    className="flex flex-col items-start w-full"
    onClick={handleLinkClick}
  >
    {collapsed ? (
      <div className="flex justify-center items-center py-2 w-full">
        <img
          src="/swasti ai logo.png"
          alt="Swasti AI"
          className="w-20 h-20 object-contain"
        />
      </div>
    ) : (
      <>
        <div className="w-full max-w-[300px] flex-shrink-0 -ml-3">
          <img
            src="/Swasti.ai bg rm logo.png"
            alt="Swasti AI Logo"
            className="w-full h-20 object-contain"
          />
        </div>

        <div className="mt-2 ml-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1F8F89]">
            Lab Module
          </h2>
        </div>
      </>
    )}
  </Link>

  <button
    onClick={onToggle}
    className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-[#EAF7F4] transition-colors z-50 absolute -right-1 top-1/2 transform -translate-y-1/2 bg-[#F4F9F7] border border-[#E2EFEA] shadow-sm"
    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    {collapsed ? (
      <ChevronRight className="text-[#2BB2A7] text-sm" />
    ) : (
      <ChevronLeft className="text-[#2BB2A7] text-sm" />
    )}
  </button>
</div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <div className="mb-4">
              {!collapsed && (
                <p className="text-[10px] font-medium text-[#1F8F89] uppercase tracking-wider px-3 mb-2">
                  Lab Menu
                </p>
              )}
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <div 
                      key={item.path} 
                      className="relative"
                      onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={item.path}
                        onClick={handleLinkClick}
                        className={`flex items-center ${
                          collapsed ? 'justify-center' : 'justify-between gap-3'
                        } px-3 py-2 rounded-lg transition-all ${
                          active
                            ? 'bg-[#EAF7F4] text-[#1A1A1A] font-semibold'
                            : 'text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]'
                        }`}
                      >
                        <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                            active ? 'text-[#2BB2A7]' : 'text-[#2BB2A7]'
                          }`}>
                            <item.icon className="text-sm" />
                          </div>
                          {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                        </div>
                        {!collapsed && active && (
                          <div className="w-1 h-6 bg-[#2BB2A7]/50 rounded-full"></div>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto border-t border-[#E2EFEA] dark:border-gray-800 bg-[#F4F9F7] dark:bg-gray-900">
            <div className="p-3">
              {!collapsed ? (
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
              {!collapsed && (
                <div className="mt-2 px-2">
                  <p className="text-[8px] text-[#1F8F89]/50 text-center">
                    Lab Portal v1.0.0
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Global Tooltip - Rendered at root level */}
      {collapsed && tooltipText && (
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