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
  X
} from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50 lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Destiny</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
