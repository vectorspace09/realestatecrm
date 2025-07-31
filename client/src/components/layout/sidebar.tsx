import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  BarChart3, 
  Users, 
  Building, 
  Handshake, 
  CheckSquare, 
  Bot, 
  Zap, 
  PieChart, 
  MessageSquare, 
  Settings, 
  Plug,
  X,
  Menu
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, current: true },
  { name: "Leads Pipeline", href: "/leads", icon: Users, badge: "23" },
  { name: "Properties", href: "/properties", icon: Building, badge: "47" },
  { name: "Deals & Transactions", href: "/deals", icon: Handshake },
  { name: "Tasks & Calendar", href: "/tasks", icon: CheckSquare },
];

const aiAutomation = [
  { name: "AI Assistant", href: "/ai", icon: Bot, badge: "online" },
  { name: "Workflow Builder", href: "/workflows", icon: Zap },
  { name: "Analytics & Reports", href: "/analytics", icon: PieChart },
];

const other = [
  { name: "Communications", href: "/communications", icon: MessageSquare },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ className, isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleNavClick = (href: string) => {
    setLocation(href);
    if (onClose) {
      onClose();
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden",
        isOpen ? "block" : "hidden"
      )} onClick={onClose} />
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">RealtyFlow</span>
            </div>
            {isMobile && onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-auto text-xs",
                          item.badge === "online" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* AI & Automation Section */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                AI & Automation
              </p>
              <div className="space-y-1">
                {aiAutomation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Section */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                {other.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="flex-1 text-left">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || "User"
                  }
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Agent • RealtyFlow
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
