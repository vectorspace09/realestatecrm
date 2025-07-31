import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
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
  User
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

export default function MobileHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Building className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">PRA Developers</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Real Estate CRM</p>
        </div>
      </div>

      {/* Right Side - User Avatar and Menu */}
      <div className="flex items-center space-x-3">
        {/* AI Status Badge */}
        <Badge variant="secondary" className="hidden sm:flex bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
          <Zap className="w-3 h-3 mr-1" />
          AI Active
        </Badge>

        {/* User Avatar */}
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.profileImageUrl} />
          <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
            {getInitials(user?.firstName, user?.lastName)}
          </AvatarFallback>
        </Avatar>

        {/* Mobile Menu */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-80 p-0 h-full max-h-screen sm:max-w-sm right-0 top-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 py-4">
                <nav className="space-y-1 px-3">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${active 
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </div>
                </Link>
                
                <a href="/api/logout">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </div>
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}