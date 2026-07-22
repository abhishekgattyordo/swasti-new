'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCases } from '@/context/CasesContext';
import Link from 'next/link';
import { 
  ClipboardList, 
  Stethoscope, 
  Calendar, 
  Heart, 
  DollarSign, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Sparkles,
  ShieldCheck,
  X,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { cases, activeUser, setActiveUser, loading } = useCases();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Metrics derived from the context with safety checks
  const caseCount = cases?.length || 0;
  const activeOTSurgeriesCount = cases?.filter(c => c?.status === 'In Surgery')?.length || 0;
 const completedSurgeriesCount = cases?.filter(c => c?.status === 'Completed & Discharged')?.length || 0;
  const pendingSurgeriesCount = cases?.filter(c => c?.status === 'Recommended' || c?.status === 'Assessment Pending')?.length || 0;

  const menuItems = [
    { id: 'cases', path: '/ot/cases', label: 'Surgery Cases', icon: ClipboardList, badge: caseCount, category: 'Clinical Core' },
    { id: 'surgeon', path: '/ot/surgeon', label: 'Surgeon Portal', icon: Stethoscope, category: 'Dashboards' },
    { id: 'ot', path: '/ot/ot', label: 'OT Occupancy', icon: Calendar, badge: activeOTSurgeriesCount > 0 ? activeOTSurgeriesCount : undefined, category: 'Dashboards' },
    { id: 'nursing', path: '/ot/nursing', label: 'Nursing Station', icon: Heart, category: 'Dashboards' },
    { id: 'admin', path: '/ot/admin', label: 'Admin & Finance', icon: DollarSign, category: 'Dashboards' },
  ];

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLinkClick = (path: string) => {
    router.push(path);
    if (onClose && window.innerWidth < 1024) onClose();
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    label: string,
  ) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipText(label);
      setTooltipPosition({
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipText(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (onClose && window.innerWidth < 1024) onClose();
    router.push('/login');
  };

  if (loading) {
    return (
      <aside className="fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen w-72 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2BB2A7] border-t-transparent animate-spin rounded-full"></div>
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
          onClick={onClose}
        />
      )}
      
      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        } w-80 bg-[#F4F9F7] border-r border-[#E2EFEA] flex flex-col transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close button for mobile */}
        {onClose && (
          <button
            className="lg:hidden absolute top-6 right-6 p-2 text-[#4A6B66] hover:text-[#2BB2A7] transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Logo Section - Left aligned with Text Below */}
        <div className="px-4 py-4 border-b border-[#E2EFEA] relative">
          <Link
            href="/ot/cases"
            className="flex flex-col items-start w-full"
            onClick={() => handleLinkClick('/ot/cases')}
          >
            {isCollapsed ? (
              <div className="flex justify-center items-center py-1">
                <img
                  src="/swasti ai logo.png"
                  alt="Swasti AI"
                  className="w-14 h-14 object-contain"
                />
              </div>
            ) : (
              <>
                <div className="w-full max-w-[220px] flex-shrink-0">
                  <img
                    src="/Swasti.ai bg rm logo.png"
                    alt="Swasti AI Logo"
                    className="w-auto h-20 object-fill"
                  />
                </div>
                <div className="mt-1 ml-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#1F8F89]">
                    OT Management
                  </h2>
                </div>
              </>
            )}
          </Link>

          {/* Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-[#EAF7F4] transition-colors z-50 absolute -right-3 top-1/2 transform -translate-y-1/2 bg-[#F4F9F7] border border-[#E2EFEA] shadow-sm"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="text-[#2BB2A7] w-4 h-4" />
            ) : (
              <ChevronLeft className="text-[#2BB2A7] w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Stats - Only when expanded */}
        {!isCollapsed && (
          <div className="px-3.5 py-2 mx-3.5 mt-3 bg-[#EAF7F4]/80 rounded-lg border border-[#E2EFEA]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-[#1F8F89]">Active OT</span>
                  <span className="text-xs font-bold text-[#1F8F89]">{activeOTSurgeriesCount}</span>
                </div>
                <div className="w-px h-4 bg-[#E2EFEA]"></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-[#1F8F89]">Pending</span>
                  <span className="text-xs font-bold text-[#1F8F89]">{pendingSurgeriesCount}</span>
                </div>
              </div>
             
            </div>
          </div>
        )}

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Clinical Core Category */}
          <div>
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-[#1F8F89] uppercase tracking-wider px-2.5 mb-2">
                Clinical Management
              </p>
            )}
            <div className="space-y-0.5">
              {menuItems
                .filter(item => item.category === 'Clinical Core')
                .map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <div 
                      key={item.id}
                      onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                      onMouseLeave={handleMouseLeave}
                      className="relative"
                    >
                      <button
                        id={`btn-nav-${item.id}`}
                        onClick={() => handleLinkClick(item.path)}
                        className={`w-full flex items-center ${
                          isCollapsed ? "justify-center" : "justify-between gap-3"
                        } px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-[#EAF7F4] text-[#1A1A1A] font-semibold"
                            : "text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                            active ? "text-[#2BB2A7]" : "text-[#2BB2A7]"
                          }`}>
                            <Icon className="w-5 h-5 flex-shrink-0" />
                          </div>
                          {!isCollapsed && (
                            <span className="text-sm truncate">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && item.badge !== undefined && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            active ? 'bg-[#2BB2A7] text-white' : 'bg-[#2BB2A7]/10 text-[#1F8F89]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Dashboards Category */}
          <div>
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-[#1F8F89] uppercase tracking-wider px-2.5 mb-2">
                Workcenter Portals
              </p>
            )}
            <div className="space-y-0.5">
              {menuItems
                .filter(item => item.category === 'Dashboards')
                .map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <div 
                      key={item.id}
                      onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                      onMouseLeave={handleMouseLeave}
                      className="relative"
                    >
                      <button
                        id={`btn-nav-${item.id}`}
                        onClick={() => handleLinkClick(item.path)}
                        className={`w-full flex items-center ${
                          isCollapsed ? "justify-center" : "justify-between gap-3"
                        } px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-[#EAF7F4] text-[#1A1A1A] font-semibold"
                            : "text-[#333333] hover:bg-[#EAF7F4]/60 hover:text-[#1A1A1A]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${
                            active ? "text-[#2BB2A7]" : "text-[#2BB2A7]"
                          }`}>
                            <Icon className="w-5 h-5 flex-shrink-0" />
                          </div>
                          {!isCollapsed && (
                            <span className="text-sm truncate">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && item.badge !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            active ? 'bg-[#2BB2A7] text-white' : 'bg-rose-500 text-white animate-pulse'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* User Profile & Footer Section */}
        <div className="mt-auto border-t border-[#E2EFEA] bg-[#F4F9F7]">
          <div className="p-3.5">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-[#EAF7F4] rounded-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {activeUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-[#1A1A1A]">
                      {activeUser?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-[#1F8F89] font-medium truncate">
                      {activeUser?.role || 'Guest'}
                    </p>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse flex-shrink-0" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div 
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] flex items-center justify-center text-white font-semibold text-sm shadow-sm cursor-pointer"
                  title={`${activeUser?.name || 'User'} (${activeUser?.role || 'Guest'})`}
                  onClick={() => setIsCollapsed(false)}
                >
                  {activeUser?.name?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
            {!isCollapsed && (
              <div className="mt-2.5 px-1.5 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2BB2A7]" />
                <p className="text-[9px] font-semibold text-[#1F8F89]/60 text-center">
                  Swasti Relational SQL Shield Active
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Global Tooltip - Rendered at root level */}
      {isCollapsed && tooltipText && (
        <div
          className="fixed px-3.5 py-2 bg-[#1A1A1A] text-[#F4F9F7] text-sm font-medium rounded-lg shadow-lg z-[9999] pointer-events-none whitespace-nowrap"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translateY(-50%)",
          }}
        >
          {tooltipText}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-3 border-transparent border-r-[#1A1A1A]"></div>
        </div>
      )}
    </>
  );
}