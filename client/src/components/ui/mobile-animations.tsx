import { ReactNode, useEffect, useState } from "react";

interface AnimatedListItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedListItem({ children, delay = 0, className = "" }: AnimatedListItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredList({ children, staggerDelay = 100, className = "" }: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedListItem key={index} delay={index * staggerDelay}>
          {child}
        </AnimatedListItem>
      ))}
    </div>
  );
}

interface PulseIndicatorProps {
  className?: string;
  color?: string;
}

export function PulseIndicator({ className = "", color = "bg-primary-500" }: PulseIndicatorProps) {
  return (
    <div className={`relative ${className}`}>
      <div className={`w-3 h-3 ${color} rounded-full`} />
      <div className={`absolute top-0 left-0 w-3 h-3 ${color} rounded-full animate-ping opacity-75`} />
    </div>
  );
}

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ onClick, icon, label, className = "" }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 right-4 w-14 h-14 
        bg-primary-600 hover:bg-primary-700 
        text-white rounded-full shadow-lg 
        flex items-center justify-center
        transform transition-all duration-200 
        active:scale-95 hover:shadow-xl
        z-40
        ${className}
      `}
      aria-label={label}
    >
      {icon}
    </button>
  );
}