import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  withPressEffect?: boolean;
  variant?: "default" | "elevated" | "outlined";
  size?: "sm" | "md" | "lg";
}

export default function EnhancedCard({ 
  children, 
  className = "", 
  onClick,
  withPressEffect = false,
  variant = "default",
  size = "md"
}: EnhancedCardProps) {
  const variants = {
    default: "bg-white dark:bg-card border border-border dark:border-border shadow-sm",
    elevated: "bg-white dark:bg-card shadow-lg border-0",
    outlined: "bg-transparent border-2 border-border dark:border-border shadow-none"
  };

  const sizes = {
    sm: "p-3 rounded-lg",
    md: "p-4 rounded-xl", 
    lg: "p-6 rounded-2xl"
  };

  return (
    <div 
      className={cn(
        variants[variant],
        sizes[size],
        withPressEffect && "transform transition-all duration-150 active:scale-[0.98] active:shadow-lg cursor-pointer hover:shadow-md",
        onClick && "cursor-pointer",
        "transition-colors duration-200",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}