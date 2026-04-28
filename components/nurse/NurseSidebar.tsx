'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    { icon: LayoutDashboard, label: 'Dashboard', href: '/nurse', color: 'from-blue-500 to-blue-700' },
    { icon: Users, label: 'My Patients', href: '/nurse/patients', color: 'from-emerald-500 to-emerald-700' },
    { icon: Activity, label: 'Vitals Entry', href: '/nurse/vitals', color: 'from-cyan-500 to-cyan-700' },
    { icon: Pill, label: 'Medications', href: '/nurse/medications', badge: 2, color: 'from-purple-500 to-purple-700' },
    { icon: FileText, label: 'Nursing Notes', href: '/nurse/nursing-notes', color: 'from-amber-500 to-amber-700' },
    { icon: CheckSquare, label: 'Tasks', href: '/nurse/tasks', badge: 3, color: 'from-orange-500 to-orange-700' },
    { icon: Bell, label: 'Alerts', href: '/nurse/alerts', badge: 1, color: 'from-red-500 to-red-700' },
    { icon: BookOpen, label: 'Shift Handover', href: '/nurse/handover', color: 'from-indigo-500 to-indigo-700' },
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

  return (
    <aside
      className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 ${
        isCollapsed ? 'w-24' : 'w-80'
      } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
    >
      {/* Close button for mobile */}
      <button
        className="lg:hidden absolute top-6 right-6 z-50 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
        {!isCollapsed ? (
          <Link href="/nurse" className="flex items-center gap-3" onClick={handleLinkClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="text-xl">🏥</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Nursing</h1>
              <p className="text-[16px] text-gray-500 dark:text-gray-400 mt-0.5 tracking-wide">Nurse Module</p>
            </div>
          </Link>
        ) : (
          <Link href="/nurse" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="text-xl">🏥</span>
            </div>
          </Link>
        )}

        {/* Collapse Button - Added z-50 to stay above all content */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50 ${
            isCollapsed 
              ? 'absolute -right-3.5 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' 
              : ''
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="text-gray-600 dark:text-gray-300 text-base" />
          ) : (
            <ChevronLeft className="text-gray-600 dark:text-gray-300 text-base" />
          )}
        </button>
      </div>

      {/* Rest of your sidebar content remains the same */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {/* Navigation items */}
          <div className="mb-6">
            {!isCollapsed && <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>}
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center ${
                      isCollapsed ? 'justify-center' : 'justify-between gap-3'
                    } px-3 py-2.5 rounded-lg transition-all group relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-800/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        active ? 'bg-blue-600 text-white' : `bg-gradient-to-br ${item.color} text-white`
                      }`}>
                        <item.icon className="text-base" />
                      </div>
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-4">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">{userRole}</p>
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
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
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
            {!isCollapsed && (
              <div className="mt-3 px-2">
                <p className="text-[8px] text-gray-400">Nursing v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}