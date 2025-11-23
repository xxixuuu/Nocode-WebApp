import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DropZoneProps {
  componentId: string | null;
  children?: ReactNode;
}

export function DropZone({ componentId, children }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: componentId || 'root',
    data: {
      componentId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] transition-colors ${
        isOver ? 'bg-primary/10 outline-dashed outline-2 outline-primary' : ''
      }`}
    >
      {children}
    </div>
  );
}
