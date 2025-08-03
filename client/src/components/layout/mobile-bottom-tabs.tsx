import { Link, useLocation } from "wouter";
import { MobileMenuTrigger } from "@/components/ui/mobile-menu";
import { 
  Home, 
  Users, 
  Building, 
  DollarSign, 
  CheckSquare,
  Zap,
  Menu
} from "lucide-react";

// AI-First Navigation: Dashboard | Leads | Pipeline | Tasks | AI
const tabItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/deals", icon: DollarSign, label: "Pipeline" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/ai", icon: Zap, label: "AI" },
];

export default function MobileBottomTabs() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50 shadow-lg mobile-bottom-nav">
      <div className="grid grid-cols-5 h-16 safe-area-bottom">
        {tabItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center justify-center h-full space-y-1 transition-all duration-200 active:scale-95 relative ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                {active && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
                <Icon className={`w-5 h-5 transition-all duration-200 ${active ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}