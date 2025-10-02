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
  X
} from 'lucide-react';
import { useState } from 'react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-30',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Destiny</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-foreground" />
          ) : (
            <X className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('p-4 border-t border-border', isCollapsed && 'px-2')}>
        <div className={cn('text-xs text-muted-foreground', isCollapsed && 'text-center')}>
          {isCollapsed ? 'v1' : 'Version 1.0.0'}
        </div>
      </div>
    </aside>
  );
}
