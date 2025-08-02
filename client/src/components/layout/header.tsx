import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
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
import { useAuth } from "@/hooks/useAuth";
import { Menu, Search, Bell, Moon, Sun, Plus, User, Settings, LogOut } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to AI page with search query
      window.location.href = `/ai?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">

          {/* Mobile menu button & Search */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* AI Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Ask AI or search leads, properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-500 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Badge className="bg-gradient-to-r from-primary-500 to-purple-600 text-white text-xs font-medium cursor-pointer"
                       onClick={handleSearch}>
                  AI
                </Badge>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                align="end"
              >
                <DropdownMenuLabel className="text-gray-900 dark:text-white font-semibold">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex-col items-start p-4">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">New Lead Added</span>
                      <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sarah Johnson submitted a new inquiry for downtown condos</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex-col items-start p-4">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Deal Closed</span>
                      <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Michael Chen successfully closed the Skyview property deal</p>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex-col items-start p-4">
                    <div className="flex items-center space-x-2 w-full">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="font-medium">Follow-up Reminder</span>
                      <span className="text-xs text-gray-400 ml-auto">3 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Time to follow up with Emma Davis about property viewing</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700 justify-center">
                  View All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick actions - Desktop only */}
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                size="sm"
                className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white"
                onClick={() => window.location.href = '/leads?action=add'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary-500 to-purple-600 text-white text-sm font-medium">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
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
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      
    </>
  );
}