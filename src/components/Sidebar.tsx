import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  Lightbulb, 
  Bot,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles',
    adminOnly: true
  },
  {
    title: 'Ideas',
    href: '/admin/ideas',
    icon: Lightbulb,
    description: 'View and manage ideas'
  },
  {
    title: 'AI Mode',
    href: '/admin/ai',
    icon: Bot,
    description: 'AI-powered insights'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { role } = useUserRole();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' && !location.pathname.includes('/users') && !location.pathname.includes('/ideas') && !location.pathname.includes('/ai');
    }
    return location.pathname.startsWith(href);
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || role === 'super_admin'
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">IdeaLabs</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => {
                      // Close mobile sidebar when item is clicked
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                  >
                    <Button
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-12 px-3",
                        isActive(item.href) && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 px-3"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};
