import { Plus } from "lucide-react";

interface NativeFABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}

export default function NativeFloatingActionButton({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  label
}: NativeFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center touch-feedback z-40"
      style={{
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
      }}
      aria-label={label}
    >
      {icon}
    </button>
  );
}