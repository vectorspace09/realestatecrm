import { useState } from 'react';

interface DragDropOptions {
  onDrop: (item: any, targetStatus: string) => void;
}

export function useDragDrop({ onDrop }: DragDropOptions) {
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedItem) {
      onDrop(draggedItem, targetStatus);
      setDraggedItem(null);
    }
  };

  return {
    draggedItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}