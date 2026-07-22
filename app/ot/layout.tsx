import React from 'react';
import ClientLayoutWrapper from '@/components/ot/ClientLayoutWrapper';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Swasti AI - Surgery & OT Management',
  description: 'A comprehensive surgery and operation theatre (OT) workflow system tracking cases from recommendation to discharge.',
};

export default function OTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 
        You can keep the Google Fonts link here; Next.js will automatically 
        hoist it into the document <head> at runtime.
      */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" 
        rel="stylesheet" 
      />
      
      {/* 
        Nested style rules can be placed here, or better yet, added 
        to your global CSS file.
      */}
      <style>{`
        @theme {
          --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
          --font-display: "Space Grotesk", sans-serif;
          --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
        }
      `}</style>

      {/* Styled wrapper instead of a body tag */}
      <div className="antialiased font-sans min-h-screen bg-background text-foreground">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </div>
    </>
  );
}