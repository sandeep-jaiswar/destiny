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
  Menu,
  X,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSidebar } from './SidebarContext';

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

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
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

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-white transition-all duration-300 z-30',
        isCollapsed ? 'w-16' : 'w-[280px]'
      )}
    >
      {/* Red Header Accent */}
      <div className="bg-[#AA0000] p-4 border-b border-white">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#CC0000]" />
              </div>
              <span className="text-xl font-bold text-white">DESTINY</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-white" />
            ) : (
              <X className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Market Status Bar */}
      {!isCollapsed && (
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
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto bg-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group',
                isActive
                  ? 'bg-[#AA0000] text-white border-l-2 border-white shadow-sm'
                  : 'text-black hover:bg-gray-50 border-l-2 border-transparent hover:border-[#CC0000]/20',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#CC0000]'
              )} />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Data Panel - Market Indices */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-white">
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
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Version 1.0.0
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
