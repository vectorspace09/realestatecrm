import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NativeListItemProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  avatarFallback?: string;
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "danger";
  };
  rightText?: string;
  showChevron?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function NativeListItem({
  title,
  subtitle,
  avatar,
  avatarFallback,
  badge,
  rightText,
  showChevron = true,
  onClick,
  children
}: NativeListItemProps) {
  const getBadgeVariant = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
      case "warning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "danger":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-card text-muted-foreground dark:bg-card dark:text-muted-foreground";
    }
  };

  return (
    <div 
      className="native-list-item"
      onClick={onClick}
    >
      {avatar && (
        <Avatar className="w-12 h-12 mr-3">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white truncate">{title}</h3>
          {rightText && (
            <span className="text-sm text-muted-foreground ml-2">{rightText}</span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        )}
        
        {badge && (
          <Badge className={`${getBadgeVariant(badge.variant)} mt-1 text-xs`}>
            {badge.text}
          </Badge>
        )}
        
        {children}
      </div>
      
      {showChevron && (
        <ChevronRight className="w-5 h-5 text-muted-foreground ml-3" />
      )}
    </div>
  );
}