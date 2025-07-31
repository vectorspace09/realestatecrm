import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import LeadCard from "./lead-card";
import PropertyCard from "./property-card";

interface KanbanColumnProps {
  column: {
    id: string;
    label: string;
    color: string;
  };
  items: any[];
  itemType: "lead" | "property";
  isDraggedOver: boolean;
  onDragStart: (e: React.DragEvent, item: any) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  draggedItemId?: string;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  green: "bg-green-500",
  red: "bg-red-500",
  gray: "bg-gray-500",
};

export default function KanbanColumn({
  column,
  items,
  itemType,
  isDraggedOver,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedItemId,
}: KanbanColumnProps) {
  const colorClass = colorMap[column.color] || "bg-gray-500";

  return (
    <div
      className={cn(
        "flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors",
        isDraggedOver && "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
      )}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn("w-3 h-3 rounded-full", colorClass)}></div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{column.label}</h3>
            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {items.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 space-y-3 min-h-96 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item) => {
            const isDragged = draggedItemId === item.id;
            
            return (
              <div
                key={item.id}
                className={cn(
                  "cursor-move transition-opacity",
                  isDragged && "opacity-50"
                )}
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                onDragEnd={onDragEnd}
              >
                {itemType === "lead" ? (
                  <LeadCard lead={item} />
                ) : (
                  <PropertyCard property={item} />
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No {itemType}s in this stage
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
