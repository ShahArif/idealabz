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
  X,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  MessageCircle,
  Calendar,
  User,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleBasedSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  role?: string;
}

// Define menu items for different roles
const getMenuItems = (role: string) => {
  const baseItems = [
    {
      title: 'Dashboard',
      href: '/ideator',
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      title: 'All Ideas',
      href: '/ideator/all-ideas',
      icon: Lightbulb,
      description: 'View all submitted ideas'
    }
  ];

  // Role-specific items
  switch (role) {
    case 'super_admin':
      return [
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
        }
      ];
    
    case 'employee':
      return [
        ...baseItems,
        {
          title: 'My Ideas',
          href: '/ideator/my-ideas',
          icon: User,
          description: 'View your submitted ideas'
        },
        {
          title: 'Submit Idea',
          href: '/ideator/submit',
          icon: Plus,
          description: 'Submit a new idea'
        },
        {
          title: 'AI Mode',
          href: '/ideator/ai',
          icon: Bot,
          description: 'AI-powered insights'
        },
        {
          title: 'Idea Validation',
          href: '/ideator/validation',
          icon: Target,
          description: 'Validate and analyze ideas'
        },
        {
          title: 'User Research',
          href: '/ideator/user-research',
          icon: Users,
          description: 'User problems and research'
        },
        {
          title: 'Competitor Analysis',
          href: '/ideator/competitors',
          icon: Target,
          description: 'Competitor research and analysis'
        },
        {
          title: 'Market Analysis',
          href: '/ideator/market',
          icon: BarChart3,
          description: 'Market size and analysis'
        }
      ];
    
    case 'product_expert':
      return [
        ...baseItems,
        {
          title: 'Discovery Review',
          href: '/ideator/discovery',
          icon: Target,
          description: 'Review discovery stage ideas'
        },
        {
          title: 'Basic Validation',
          href: '/ideator/basic-validation',
          icon: CheckCircle,
          description: 'Validate basic concepts'
        },
        {
          title: 'AI Mode',
          href: '/ideator/ai',
          icon: Bot,
          description: 'AI-powered insights'
        },
        {
          title: 'Idea Validation',
          href: '/ideator/validation',
          icon: Target,
          description: 'Validate and analyze ideas'
        },
        {
          title: 'User Research',
          href: '/ideator/user-research',
          icon: Users,
          description: 'User problems and research'
        },
        {
          title: 'Competitor Analysis',
          href: '/ideator/competitors',
          icon: Target,
          description: 'Competitor research and analysis'
        },
        {
          title: 'Market Analysis',
          href: '/ideator/market',
          icon: BarChart3,
          description: 'Market size and analysis'
        }
      ];
    
    case 'tech_expert':
      return [
        ...baseItems,
        {
          title: 'Tech Validation',
          href: '/ideator/tech-validation',
          icon: AlertCircle,
          description: 'Technical feasibility review'
        },
        {
          title: 'AI Mode',
          href: '/ideator/ai',
          icon: Bot,
          description: 'AI-powered insights'
        },
        {
          title: 'Idea Validation',
          href: '/ideator/validation',
          icon: Target,
          description: 'Validate and analyze ideas'
        },
        {
          title: 'User Research',
          href: '/ideator/user-research',
          icon: Users,
          description: 'User problems and research'
        },
        {
          title: 'Competitor Analysis',
          href: '/ideator/competitors',
          icon: Target,
          description: 'Competitor research and analysis'
        },
        {
          title: 'Market Analysis',
          href: '/ideator/market',
          icon: BarChart3,
          description: 'Market size and analysis'
        }
      ];
    
    case 'leader':
      return [
        ...baseItems,
        {
          title: 'Leadership Pitch',
          href: '/ideator/leadership-pitch',
          icon: TrendingUp,
          description: 'Review pitch-ready ideas'
        },
        {
          title: 'MVP Review',
          href: '/ideator/mvp',
          icon: BarChart3,
          description: 'MVP and POC review'
        },
        {
          title: 'AI Mode',
          href: '/ideator/ai',
          icon: Bot,
          description: 'AI-powered insights'
        },
        {
          title: 'Idea Validation',
          href: '/ideator/validation',
          icon: Target,
          description: 'Validate and analyze ideas'
        },
        {
          title: 'User Research',
          href: '/ideator/user-research',
          icon: Users,
          description: 'User problems and research'
        },
        {
          title: 'Competitor Analysis',
          href: '/ideator/competitors',
          icon: Target,
          description: 'Competitor research and analysis'
        },
        {
          title: 'Market Analysis',
          href: '/ideator/market',
          icon: BarChart3,
          description: 'Market size and analysis'
        }
      ];
    
    case 'idea_mentor':
      return [
        ...baseItems,
        {
          title: 'Mentor Ideas',
          href: '/ideator/mentor',
          icon: MessageCircle,
          description: 'Mentor and guide ideas'
        },
        {
          title: 'AI Mode',
          href: '/ideator/ai',
          icon: Bot,
          description: 'AI-powered insights'
        },
        {
          title: 'Idea Validation',
          href: '/ideator/validation',
          icon: Target,
          description: 'Validate and analyze ideas'
        },
        {
          title: 'User Research',
          href: '/ideator/user-research',
          icon: Users,
          description: 'User problems and research'
        },
        {
          title: 'Competitor Analysis',
          href: '/ideator/competitors',
          icon: Target,
          description: 'Competitor research and analysis'
        },
        {
          title: 'Market Analysis',
          href: '/ideator/market',
          icon: BarChart3,
          description: 'Market size and analysis'
        }
      ];
    
    case 'idealabs_core_team':
      return [
        ...baseItems,
        {
          title: 'Core Team',
          href: '/ideator/core-team',
          icon: Settings,
          description: 'Core team activities'
        },
        {
          title: 'AI Mode',
          href: '/ideator/ai',
          icon: Bot,
          description: 'AI-powered insights'
        },
        {
          title: 'Idea Validation',
          href: '/ideator/validation',
          icon: Target,
          description: 'Validate and analyze ideas'
        },
        {
          title: 'User Research',
          href: '/ideator/user-research',
          icon: Users,
          description: 'User problems and research'
        },
        {
          title: 'Competitor Analysis',
          href: '/ideator/competitors',
          icon: Target,
          description: 'Competitor research and analysis'
        },
        {
          title: 'Market Analysis',
          href: '/ideator/market',
          icon: BarChart3,
          description: 'Market size and analysis'
        }
      ];
    
    default:
      return baseItems;
  }
};

export const RoleBasedSidebar: React.FC<RoleBasedSidebarProps> = ({ isOpen, onToggle, role }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { role: userRole } = useUserRole();
  
  // Use passed role prop or fallback to user role
  const currentRole = role || userRole;
  const menuItems = getMenuItems(currentRole || 'employee');

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' && !location.pathname.includes('/users') && !location.pathname.includes('/ideas') && !location.pathname.includes('/ai');
    }
    if (href === '/ideator') {
      return location.pathname === '/ideator' && !location.pathname.includes('/all-ideas') && !location.pathname.includes('/my-ideas') && !location.pathname.includes('/submit');
    }
    return location.pathname.startsWith(href);
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || currentRole === 'super_admin'
  );

  const getBasePath = () => {
    if (currentRole === 'super_admin') return '/admin';
    return '/ideator';
  };

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

          {/* Role Badge */}
          <div className="px-6 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {currentRole ? currentRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Employee'}
              </span>
            </div>
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
