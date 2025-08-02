import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Menu,
  X,
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
  Puzzle,
  LogOut,
  Sun,
  Moon
} from "lucide-react";

const allNavigationItems = [
  { href: "/", icon: Home, label: "Dashboard", category: "primary" },
  { href: "/leads", icon: Users, label: "Leads", category: "primary" },
  { href: "/properties", icon: Building, label: "Properties", category: "primary" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks", category: "primary" },
  { href: "/deals", icon: DollarSign, label: "Deals", category: "secondary" },
  { href: "/ai", icon: Zap, label: "AI Assistant", category: "secondary" },
  { href: "/integrations", icon: Puzzle, label: "Integrations", category: "secondary" },
  { href: "/analytics", icon: BarChart3, label: "Analytics", category: "secondary" },
  { href: "/workflows", icon: Workflow, label: "Workflows", category: "secondary" },
  { href: "/communications", icon: MessageSquare, label: "Communications", category: "secondary" },
  { href: "/settings", icon: Settings, label: "Settings", category: "secondary" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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

  const primaryItems = allNavigationItems.filter(item => item.category === "primary");
  const secondaryItems = allNavigationItems.filter(item => item.category === "secondary");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-full w-full max-w-full p-0 bg-gray-900 border-gray-700">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">Menu</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Profile */}
            <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Primary Navigation */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Main
              </h3>
              <div className="space-y-1">
                {primaryItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        active 
                          ? "bg-primary-600 text-white" 
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Secondary Navigation */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Tools & Settings
              </h3>
              <div className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        active 
                          ? "bg-primary-600 text-white" 
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Theme Toggle */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Appearance
              </h3>
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-5 h-5 mr-3" />
                    Switch to Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 mr-3" />
                    Switch to Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-700">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MobileMenuTrigger() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all duration-200 active:scale-95 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <Menu className="w-6 h-6" />
      </button>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}