

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  LayoutDashboard,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Activity,
  LogOut,
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { MODULE_KEYS, DOCTOR_FEATURES } from '@/lib/feature';

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  color: string;
  featureKey: string;
}

export default function DoctorSidebar({ isOpen, onClose }: DoctorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('Doctor');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  
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
        // Capitalize the doctor name
        const rawName = user.full_name_en || user.name || 'Doctor';
        setUserName(capitalizeName(rawName));
        setDoctorSpecialty(user.specialty || user.department || 'Physician');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
     
  }, []); // run once after mount

  // Function to capitalize first letter of each word in a name
  const capitalizeName = (name: string) => {
    if (!name) return 'Doctor';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isDashboardEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.DASHBOARD);
  const isScheduleEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.SCHEDULE);
  const isPatientsEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.PATIENTS);
  const isBillingEnabled = isMicroFeatureEnabled(MODULE_KEYS.DOCTOR, DOCTOR_FEATURES.BILLING);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

 const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/doctor/dashboard', color: 'from-emerald-500 to-emerald-700', featureKey: DOCTOR_FEATURES.DASHBOARD },
  { icon: Calendar, label: 'Schedule', href: '/doctor/schedule', badge: '12', color: 'from-blue-500 to-blue-700', featureKey: DOCTOR_FEATURES.SCHEDULE },
  { icon: Users, label: 'Patients', href: '/doctor/patients', badge: '5', color: 'from-purple-500 to-purple-700', featureKey: DOCTOR_FEATURES.PATIENTS },
  { icon: Users, label: 'Admitted Patients', href: '/doctor/admitted-patients', badge: '5', color: 'from-indigo-500 to-indigo-700', featureKey: 'admitted_patients' },  // ✅ ADD THIS
  { icon: CreditCard, label: 'Billing', href: '/doctor/billing', badge: '3', color: 'from-amber-500 to-amber-700', featureKey: DOCTOR_FEATURES.BILLING },
];
  const visibleNavItems = navItems.filter(item => {
  switch (item.featureKey) {
    case DOCTOR_FEATURES.DASHBOARD: return isDashboardEnabled;
    case DOCTOR_FEATURES.SCHEDULE: return isScheduleEnabled;
    case DOCTOR_FEATURES.PATIENTS: return isPatientsEnabled;
    case DOCTOR_FEATURES.BILLING: return isBillingEnabled;
    case 'admitted_patients': return true;  // ✅ No tenant restriction
    default: return true;
  }
});

  const quickAccessItems = [
    { icon: User, label: 'New Appointment', href: '/doctor/patients/new', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
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

  // Show loading state while tenant is being fetched
  if (isTenantLoading) {
    return (
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-80'
        } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
      >
        {/* Logo Section with Loading Skeleton */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center animate-pulse">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          )}
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
      } flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-out shadow-xl lg:shadow-none h-screen`}
    >
      {/* Close button for mobile */}
      <button
        className="lg:hidden absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 dark:border-gray-800 relative`}>
        {!isCollapsed ? (
          <Link href="/doctor/dashboard" className="flex items-center gap-4" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight dark:text-white">{tenantName || 'HealthSync'}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Doctor Portal</p>
            </div>
          </Link>
        ) : (
          <Link href="/doctor/dashboard" className="flex items-center justify-center" onClick={handleLinkClick}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
          </Link>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isCollapsed ? 'absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm' : ''
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="text-gray-600 dark:text-gray-300 w-4 h-4" /> : <ChevronLeft className="text-gray-600 dark:text-gray-300 w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto px-4 py-8">
          {visibleNavItems.length > 0 && (
            <div className="mb-6">
              {!isCollapsed && <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">Main Navigation</p>}
              <div className="space-y-2">
                {visibleNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-between gap-4'
                      } px-4 py-3 rounded-xl transition-all group relative ${
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
                          <item.icon className="w-4 h-4" />
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Access */}
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
                      <item.icon className="w-4 h-4" />
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
                    <item.icon className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
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
                    <p className="text-sm font-semibold truncate dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doctorSpecialty}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
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
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
                </button>
              </div>
            )}
            {!isCollapsed && (
              <div className="mt-3 px-3">
                <p className="text-xs text-gray-400 dark:text-gray-500">Doctor Portal v1.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}