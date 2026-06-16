




'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Activity,
  Pill,
  FileText,
  CheckSquare,
  Bell,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
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
  color: string;
}

export default function NurseSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Nurse');
  const [userRole, setUserRole] = useState('Staff Nurse');
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.full_name_en || user.name || 'Nurse');
        setUserRole(user.role === 'head-nurse' ? 'Head Nurse' : 'Staff Nurse');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/nurse', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: Users, label: 'My Patients', href: '/nurse/patients', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: Activity, label: 'Vitals Entry', href: '/nurse/vitals', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: Pill, label: 'Medications', href: '/nurse/medications', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: FileText, label: 'Nursing Notes', href: '/nurse/nursing-notes', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: CheckSquare, label: 'Tasks', href: '/nurse/tasks', color: 'from-[#3B1E6F] to-[#7A329F]' },
    { icon: BookOpen, label: 'Shift Handover', href: '/nurse/handover', color: 'from-[#3B1E6F] to-[#7A329F]' },
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
    if (href === '/nurse') {
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
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 ${
          isCollapsed ? 'w-24' : 'w-80'
        } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 z-50 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section - Logo Left aligned with Text Below */}
        <div className={`px-4 py-1 flex flex-col items-start border-b border-gray-100 dark:border-gray-800 relative`}>
  <Link href="/nurse" className="flex flex-col items-start w-full" onClick={handleLinkClick}>
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
    
    {/* Text - Only show Nursing */}
    {!isCollapsed && (
   <h1 className="text-lg font-bold tracking-tight text-[#3B1E6F] dark:text-white text-left">
  Nursing
</h1>
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

        {/* Rest of your sidebar content */}
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {/* Navigation items */}
            <div className="mb-4">
              {!isCollapsed && <p className="text-[10px] font-medium text-[#3B1E6F] uppercase tracking-wider px-3 mb-2">Main Menu</p>}
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
          </nav>

          {/* User Profile & Logout - Compact */}
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
                    <LogOut className="w-3.5 h-3.5" />
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
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {!isCollapsed && (
                <div className="mt-2 px-2">
                  <p className="text-[8px] text-[#1A438A]/50 dark:text-gray-500 text-center">Nursing v1.0.0</p>
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