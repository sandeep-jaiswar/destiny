'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  Star, 
  Search, 
  Settings,
  X,
  Clock
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Charts', href: '/charts/AAPL', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
  { name: 'Screener', href: '/screener', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-white border-r border-white z-50 lg:hidden">
        {/* Professional Red Header */}
        <div className="bg-[#AA0000] p-4 border-b border-white">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#CC0000]" />
              </div>
              <span className="text-xl font-bold text-white">DESTINY</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Market Status Bar */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse" />
              <span className="font-medium text-black">MARKET OPEN</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 font-mono">
              <Clock className="w-3 h-3" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto bg-white" style={{ height: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group',
                  isActive
                    ? 'bg-[#AA0000] text-white border-l-2 border-white shadow-sm'
                    : 'text-black hover:bg-gray-50 border-l-2 border-transparent hover:border-[#CC0000]/20'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#CC0000]'
                )} />
                <span className="ml-3 font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Data Panel - Market Indices */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-600 mb-2">MARKET INDICES</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-black font-medium">S&P 500</span>
                <span className="font-mono text-[#00FF00]">+0.45%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-black font-medium">NASDAQ</span>
                <span className="font-mono text-[#00FF00]">+0.82%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-black font-medium">DOW</span>
                <span className="font-mono text-[#FF6666]">-0.15%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
