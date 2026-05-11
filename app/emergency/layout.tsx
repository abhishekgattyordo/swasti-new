// app/emergency/layout.tsx
'use client';

import { useState } from 'react';
import EmergencySidebar from '@/components/emergency/EmergencySidebar';
import { Stethoscope } from 'lucide-react';

// Add this interface
interface EmergencyLayoutProps {
  children: React.ReactNode;
}

export default function EmergencyLayout({ children }: EmergencyLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <EmergencySidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        onClick={() => setSidebarOpen(true)}
      >
        <Stethoscope className="w-5 h-5 text-red-600" />
      </button>
      
      <main className="flex-1 overflow-y-auto lg:ml-0">
        {/* Added padding for better spacing on all screens */}
        <div className="px-4 py-6 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}