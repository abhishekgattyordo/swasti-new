// app/layout.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/nurse/NurseSidebar';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="flex min-h-screen">
          {/* Sidebar - sticky for desktop */}
          <aside className="hidden lg:block sticky top-0 h-screen">
            <Sidebar 
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)} 
            />
          </aside>

          {/* Mobile Sidebar Toggle - Add if needed */}
          {/* <MobileSidebar /> */}

          {/* Main Content */}
          <main className="flex-1 min-h-screen w-full lg:w-auto">
            {children}
          </main>
        </div>
        
        {/* Toast notifications (optional) */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}



// import type { Metadata } from 'next';
// import Sidebar from '@/components/nurse/NurseSidebar';

// export const metadata: Metadata = {
//   title: 'Hospital Nurse Module',
//   description: 'Complete nursing management dashboard',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-white">
//         <div className="flex">
//           {/* Sidebar */}
//           <Sidebar />

//           {/* Main Content */}
//           <main className="flex-1 min-h-screen">
//             {children}
//           </main>
//         </div>
//       </body>
//     </html>
//   );
// }
