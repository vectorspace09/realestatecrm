import { useState } from 'react';

interface DragDropOptions {
  onDrop?: (item: any, targetStatus: string) => void;
  onItemMove?: (itemId: string, targetColumnId: string) => void;
}

export function useDragDrop({ onDrop, onItemMove }: DragDropOptions) {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId?: string) => {
    e.preventDefault();
    if (columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the entire drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem) {
      if (onDrop) {
        onDrop(draggedItem, targetStatus);
      }
      if (onItemMove) {
        onItemMove(draggedItem.id, targetStatus);
      }
      setDraggedItem(null);
      setDragOverColumn(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

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