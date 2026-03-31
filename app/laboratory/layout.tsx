"use client";

import { useState } from "react";
import { LabSidebar } from "@/components/laboratory/Sidebar";

export default function LaboratoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LabSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main 
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'ml-20' : 'ml-72'}
        `}
      >
        {children}
      </main>
    </div>
  );
}