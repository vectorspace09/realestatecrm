import { Link, useLocation } from "wouter";
import { MobileMenuTrigger } from "@/components/ui/mobile-menu";
import { 
  Home, 
  Users, 
  Building, 
  DollarSign, 
  Menu
} from "lucide-react";

const tabItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/properties", icon: Building, label: "Properties" },
  { href: "/deals", icon: DollarSign, label: "Deals" },
  { type: "menu", icon: Menu, label: "More" },
];

export default function MobileBottomTabs() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg mobile-bottom-nav">
      <div className="grid grid-cols-5 h-16 safe-area-bottom">
        {tabItems.map((item, index) => {
          const Icon = item.icon;
          
          if (item.type === "menu") {
            return (
              <div key="menu" className="flex flex-col items-center justify-center h-full space-y-1 transition-all duration-200 active:scale-95">
                <MobileMenuTrigger />
                <span className="text-xs font-medium text-gray-400">{item.label}</span>
              </div>
            );
          }
          
          const active = isActive(item.href!);
          
          return (
            <Link key={item.href} href={item.href!}>
              <div className={`flex flex-col items-center justify-center h-full space-y-1 transition-all duration-200 active:scale-95 relative ${
                active 
                  ? "text-primary-600 dark:text-primary-400" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}>
                {active && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}