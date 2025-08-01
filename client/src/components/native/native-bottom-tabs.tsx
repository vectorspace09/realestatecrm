import { Home, Users, Building, HandCoins, Settings, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

const tabs = [
  { id: "/", icon: Home, label: "Home" },
  { id: "/leads", icon: Users, label: "Leads" },
  { id: "/properties", icon: Building, label: "Properties" },
  { id: "/deals", icon: HandCoins, label: "Deals" },
  { id: "/settings", icon: Settings, label: "Settings" },
];

export default function NativeBottomTabs() {
  const [location, navigate] = useLocation();

  return (
    <div className="app-bottom-nav">
      <div className="flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.id || (tab.id !== "/" && location.startsWith(tab.id));
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`native-tab ${isActive ? 'active' : ''}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                {tab.label}
              </span>
              <div className="tab-indicator" />
            </button>
          );
        })}
      </div>
    </div>
  );
}