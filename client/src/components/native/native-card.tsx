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
      className={`native-card ${withPressEffect ? 'touch-feedback' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}