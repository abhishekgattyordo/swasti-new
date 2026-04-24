'use client';

import { useState } from 'react';
import BillingSidebar from '@/components/billing/BillingSidebar';
import { Menu} from 'lucide-react';

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar – rendered once */}
      <BillingSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white rounded-lg shadow-md border"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content – pages will be injected here */}
      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        {children}
      </div>
    </div>
  );
}