import { Badge } from "@/components/ui/badge";

interface StatusItem {
  label: string;
  count: number;
  color: "blue" | "green" | "yellow" | "red" | "gray";
}

interface NativeStatusBarProps {
  items: StatusItem[];
}

export default function NativeStatusBar({ items }: NativeStatusBarProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
      yellow: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 rounded-xl backdrop-blur-sm">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col items-center space-y-1">
          <Badge className={`text-xs px-2 py-1 ${getColorClasses(item.color)}`}>
            {item.count}
          </Badge>
          <span className="text-xs text-gray-400 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}