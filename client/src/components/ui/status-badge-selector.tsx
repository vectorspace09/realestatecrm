import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

export interface StatusOption {
  value: string;
  label: string;
  color: string;
  bgClass: string;
}

interface StatusBadgeSelectorProps {
  currentStatus: string;
  options: StatusOption[];
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  size?: "sm" | "default";
}

export default function StatusBadgeSelector({
  currentStatus,
  options,
  onStatusChange,
  disabled = false,
  size = "default"
}: StatusBadgeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = options.find(option => option.value === currentStatus) || options[0];

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  if (disabled) {
    return (
      <Badge className={`${currentOption.bgClass} ${size === "sm" ? "text-xs px-2 py-1" : ""}`}>
        {currentOption.label}
      </Badge>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-auto p-0 hover:bg-transparent ${size === "sm" ? "text-xs" : ""}`}
        >
          <Badge className={`${currentOption.bgClass} ${size === "sm" ? "text-xs px-2 py-1" : ""} cursor-pointer hover:opacity-80 transition-opacity`}>
            {currentOption.label}
            <ChevronDown className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} ml-1`} />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-48 bg-gray-800 border-gray-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
          >
            <div className="flex items-center space-x-2">
              <Badge className={`${option.bgClass} text-xs`}>
                {option.label}
              </Badge>
            </div>
            {option.value === currentStatus && (
              <Check className="w-4 h-4 text-primary-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Predefined status options for different entities
export const LEAD_STATUS_OPTIONS: StatusOption[] = [
  { value: "new", label: "New", color: "blue", bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  { value: "contacted", label: "Contacted", color: "purple", bgClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" },
  { value: "qualified", label: "Qualified", color: "emerald", bgClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" },
  { value: "tour", label: "Tour Scheduled", color: "amber", bgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
  { value: "offer", label: "Offer Made", color: "orange", bgClass: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" },
  { value: "closed", label: "Closed", color: "green", bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "nurturing", label: "Nurturing", color: "gray", bgClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100" }
];

export const PROPERTY_STATUS_OPTIONS: StatusOption[] = [
  { value: "available", label: "Available", color: "emerald", bgClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" },
  { value: "pending", label: "Under Contract", color: "amber", bgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
  { value: "sold", label: "Sold", color: "green", bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "withdrawn", label: "Off Market", color: "gray", bgClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100" }
];

export const DEAL_STATUS_OPTIONS: StatusOption[] = [
  { value: "prospect", label: "Prospect", color: "blue", bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  { value: "negotiation", label: "Negotiation", color: "amber", bgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
  { value: "contract", label: "Under Contract", color: "purple", bgClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100" },
  { value: "closing", label: "Closing", color: "orange", bgClass: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" },
  { value: "closed", label: "Closed", color: "green", bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "lost", label: "Lost", color: "red", bgClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" }
];

export const TASK_STATUS_OPTIONS: StatusOption[] = [
  { value: "pending", label: "Pending", color: "gray", bgClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100" },
  { value: "in_progress", label: "In Progress", color: "blue", bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  { value: "completed", label: "Completed", color: "green", bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "cancelled", label: "Cancelled", color: "red", bgClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" }
];