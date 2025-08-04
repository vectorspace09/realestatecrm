import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { 
  Menu, 
  Search, 
  Bell,
  User as UserIcon, 
  Settings, 
  LogOut,
  Home, 
  Users, 
  Building, 
  DollarSign, 
  CheckSquare, 
  BarChart3, 
  Zap, 
  MessageSquare,
  Workflow,
  X
} from "lucide-react";

const navigationItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/properties", icon: Building, label: "Properties" },
  { href: "/deals", icon: DollarSign, label: "Deals" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/workflows", icon: Workflow, label: "Workflows" },
  { href: "/ai", icon: Zap, label: "AI Assistant" },
  { href: "/communications", icon: MessageSquare, label: "Communications" },
];

// Helper function to get user initials
const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined): string => {
  if (!firstName && !lastName) return "U";
  const first = firstName?.[0]?.toUpperCase() || "";
  const last = lastName?.[0]?.toUpperCase() || "";
  return first + last;
};

interface ResponsiveHeaderProps {
  onMenuClick?: () => void;
  showMobileNav?: boolean;
}

export default function ResponsiveHeader({ onMenuClick, showMobileNav = true }: ResponsiveHeaderProps) {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/ai?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-white hover:bg-card/50 transition-all duration-200 active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 bg-card border-border p-0"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">PRA Developers</h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white">
                  {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.firstName || user?.lastName || "User"
                  }
                </p>
                <p className="text-sm text-muted-foreground">{user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleMenuItemClick}
                  >
                    <div className={`
                      flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                      ${active 
                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-600/20 text-primary-400 border border-primary-500/30' 
                        : 'text-muted-foreground hover:text-white hover:bg-card/50'
                      }
                    `}>
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Link href="/settings" onClick={handleMenuItemClick}>
              <div className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-card/50 transition-all duration-200">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={`
      sticky top-0 z-50 transition-all duration-300 backdrop-blur-md
      ${isScrolled 
        ? 'bg-card/95 shadow-lg shadow-gray-900/20 border-b border-border/50' 
        : 'bg-card/90 border-b border-border/30'
      }
    `}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo/Brand - Moved to extreme left */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                  PRA Developers
                </h1>
              </div>
            </div>
          </Link>

          {/* Left Section - Navigation */}
          <div className="flex items-center space-x-4 ml-8">
            {/* Mobile Menu */}
            {isMobile && showMobileNav && <MobileNavigation />}

            {/* Desktop Navigation - All items in single row */}
            {!isMobile && (
              <nav className="hidden lg:flex items-center space-x-1 ml-8 flex-1">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-sm font-medium transition-all duration-200 hover:bg-secondary/80 active:scale-95 ${
                        location === item.href 
                          ? "text-primary bg-primary/10 hover:bg-primary/20" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-1" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            )}
          </div>



          {/* Right Section */}
          <div className="flex items-center space-x-3">


            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-card/50 transition-all duration-200">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm font-medium">
                      {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 bg-card border-border" 
                align="end" 
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : "User"
                      }
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-card" />
                <DropdownMenuItem className="text-muted-foreground hover:text-white hover:bg-card">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-muted-foreground hover:text-white hover:bg-card"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-card" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar Row - Mobile */}
        {isMobile && (
          <div className="pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Ask AI or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-16 py-2.5 bg-card/50 border-border text-white placeholder-gray-400 focus:bg-card focus:border-primary-500 transition-all duration-200 rounded-xl"
              />
              <button
                onClick={handleSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Badge className="bg-gradient-to-r from-primary-500 to-purple-600 text-white text-xs font-medium cursor-pointer hover:shadow-lg transition-all duration-200">
                  <Zap className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar Row - Desktop */}
        {!isMobile && (
          <div className="border-t border-border/30 px-4 lg:px-6 py-3">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Ask AI or search leads, properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-16 py-2 bg-card/50 border-border text-white placeholder-gray-400 focus:bg-card focus:border-primary-500 transition-all duration-200"
                />
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Badge className="bg-gradient-to-r from-primary-500 to-purple-600 text-white text-xs font-medium cursor-pointer hover:shadow-lg transition-all duration-200">
                    <Zap className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}