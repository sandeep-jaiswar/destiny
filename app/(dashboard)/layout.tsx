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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-[280px]">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between p-4 bg-primary border-b border-primary">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <span className="text-xl font-bold text-white">DESTINY</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
