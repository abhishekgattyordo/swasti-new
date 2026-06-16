"use client";

import { useState } from "react";
import { LabSidebar } from "@/components/laboratory/Sidebar";

export default function LaboratoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        onClick={openSidebar}
      >
        <svg className="w-5 h-5 text-[#3B1E6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <LabSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <main 
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'}
          ml-0
          p-4 lg:p-6
          min-h-screen
        `}
      >
        {/* Simple Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Laboratory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clinical Lab Management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}