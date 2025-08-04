interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "secondary" | "white";
}

export default function LoadingSpinner({ 
  size = "md", 
  className = "",
  color = "primary" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const colorClasses = {
    primary: "border-primary-600 border-t-transparent",
    secondary: "border-border border-t-transparent",
    white: "border-white border-t-transparent"
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-2 rounded-full animate-spin
        ${className}
      `}
    />
  );
}