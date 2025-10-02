'use client';

import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between p-4 bg-card border-b border-border">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <span className="text-xl font-bold text-foreground">Destiny</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
