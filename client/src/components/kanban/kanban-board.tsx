import { useDragDrop } from "@/hooks/use-drag-drop";
import KanbanColumn from "./kanban-column";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  columns: Array<{
    id: string;
    label: string;
    color: string;
  }>;
  items: Record<string, any[]>;
  onItemMove: (itemId: string, targetColumnId: string) => void;
  isLoading?: boolean;
  itemType: "lead" | "property";
}

export default function KanbanBoard({ 
  columns, 
  items, 
  onItemMove, 
  isLoading = false,
  itemType 
}: KanbanBoardProps) {
  const {
    draggedItem,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragDrop({ onItemMove });

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 min-h-96">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          items={items[column.id] || []}
          itemType={itemType}
          isDraggedOver={dragOverColumn === column.id}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
          onDragEnd={handleDragEnd}
          draggedItemId={draggedItem?.id}
        />
      ))}
    </div>
  );
}
