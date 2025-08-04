import { ReactNode } from "react";

interface NativeCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  withPressEffect?: boolean;
}

export default function NativeCard({ 
  children, 
  className = "", 
  onClick,
  withPressEffect = false 
}: NativeCardProps) {
  return (
    <div 
      className={`
        bg-white dark:bg-card rounded-xl p-4 shadow-sm border border-border dark:border-border
        ${withPressEffect ? 'transform transition-all duration-150 active:scale-[0.98] active:shadow-lg cursor-pointer hover:shadow-md' : ''} 
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}