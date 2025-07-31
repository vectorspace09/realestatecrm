import { useState, useCallback } from "react";

export interface DragDropItem {
  id: string;
  [key: string]: any;
}

interface UseDragDropProps {
  onItemMove: (itemId: string, targetColumnId: string) => void;
}

export function useDragDrop({ onItemMove }: UseDragDropProps) {
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: DragDropItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", item.id);
    
    // Add drag visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const columnElement = e.currentTarget as HTMLElement;
    const columnId = columnElement.getAttribute("data-column-id");
    if (columnId) {
      setDragOverColumn(columnId);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drag over state if we're leaving the column container
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem.id) {
      onItemMove(draggedItem.id, targetColumnId);
    }
    
    setDraggedItem(null);
    setDragOverColumn(null);
  }, [draggedItem, onItemMove]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    
    setDraggedItem(null);
    setDragOverColumn(null);
  }, []);

  return {
    draggedItem,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
