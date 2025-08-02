import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NativeHeaderProps {
  title: string;
  onBack?: () => void;
  onBackClick?: () => void;
  rightButton?: React.ReactNode;
  showBack?: boolean;
  showBackButton?: boolean;
}

export default function NativeHeader({ 
  title, 
  onBack, 
  onBackClick,
  rightButton, 
  showBack = false,
  showBackButton = false
}: NativeHeaderProps) {
  return (
    <div className="app-header">
      <div className="native-nav-header">
        <div className="w-10 h-10">
          {(showBack || showBackButton) && (
            <button
              onClick={onBack || onBackClick}
              className="native-nav-button"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        
        <h1 className="native-nav-title">{title}</h1>
        
        <div className="w-10 h-10">
          {rightButton || (
            <button className="native-nav-button">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}