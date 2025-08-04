import { Home, Users, Building, HandCoins, CheckSquare, Zap, Puzzle, Settings, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { MobileMenuTrigger } from "@/components/ui/mobile-menu";

const tabs = [
  { id: "/", icon: Home, label: "Home" },
  { id: "/leads", icon: Users, label: "Leads" },
  { id: "/properties", icon: Building, label: "Properties" },
  { id: "/tasks", icon: CheckSquare, label: "Tasks" },
  { type: "menu", icon: Menu, label: "More" },
];

export default function NativeBottomTabs() {
  const [location, navigate] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-border dark:border-border z-50 shadow-lg">
      <div className="flex items-center justify-around py-2 px-4 pb-safe">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          
          if (tab.type === "menu") {
            return (
              <div key="menu" className="flex flex-col items-center justify-center py-2 px-1">
                <MobileMenuTrigger />
                <span className="text-xs mt-1 font-medium text-muted-foreground dark:text-muted-foreground">
                  {tab.label}
                </span>
              </div>
            );
          }
          
          const isActive = location === tab.id || (tab.id !== "/" && location.startsWith(tab.id));
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 active:scale-95 relative ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
              <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs mt-1 font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}