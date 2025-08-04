import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { 
  Home, 
  Users, 
  Building, 
  DollarSign, 
  CheckSquare, 
  BarChart3, 
  Zap, 
  MessageSquare,
  Settings,
  Workflow,
  LogOut,
  Sun,
  Moon,
  Plus
} from "lucide-react";

const navigationItems = {
  primary: [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/leads", icon: Users, label: "Leads" },
    { href: "/properties", icon: Building, label: "Properties" },
    { href: "/deals", icon: DollarSign, label: "Deals" },
    { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  ],
  secondary: [
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/workflows", icon: Workflow, label: "Workflows" },
    { href: "/ai", icon: Zap, label: "AI Assistant" },
    { href: "/communications", icon: MessageSquare, label: "Communications" },
  ]
};

export default function DesktopHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

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

  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <Link key={item.href} href={item.href}>
        <Button
          variant={active ? "default" : "outline"}
          size="sm"
          className={`px-3 py-1.5 text-sm transition-all ${
            active 
              ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600" 
              : "bg-card text-muted-foreground dark:text-muted-foreground border-border dark:border-border hover:bg-card hover:border-border dark:hover:border-border"
          }`}
        >
          <Icon className="w-3.5 h-3.5 mr-1.5" />
          {item.label}
        </Button>
      </Link>
    );
  };

  return (
    <header className="bg-white dark:bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Brand */}
        <div className="flex items-center">
          <div>
            <h1 className="text-xl font-bold text-foreground dark:text-white">PRA Developers</h1>
            <p className="text-sm text-muted-foreground">Real Estate CRM</p>
          </div>
        </div>

        {/* Center - Navigation in single row */}
        <nav className="hidden lg:flex items-center space-x-2">
          {/* All navigation items in one row */}
          {navigationItems.primary.map((item) => renderNavItem(item))}
          {navigationItems.secondary.map((item) => renderNavItem(item))}
        </nav>

        {/* Right Side - Actions and User */}
        <div className="flex items-center space-x-3">
          {/* Add Lead Button */}
          <Button
            size="sm"
            onClick={() => window.location.href = '/leads?action=add'}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Lead
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Settings */}
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>

          {/* User Avatar and Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            
            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}