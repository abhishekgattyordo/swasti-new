// app/nurse/layout.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/nurse/NurseSidebar';

export default function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen w-full lg:w-auto">
        {children}
      </main>
    </div>
  );
}

