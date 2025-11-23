import { useDraggable } from '@dnd-kit/core';
import { componentDefinitions } from '../../lib/componentDefinitions';
import * as Icons from 'lucide-react';

interface DraggableComponentProps {
  component: {
    type: string;
    label: string;
    icon: string;
    category: string;
  };
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: {
      type: component.type,
      fromPalette: true,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  // Get icon component from lucide-react
  const IconComponent = (Icons as any)[component.icon] || Icons.Square;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent cursor-move transition-colors"
    >
      <IconComponent className="w-4 h-4" />
      <span className="text-sm font-medium">{component.label}</span>
    </div>
  );
}

export function ComponentPalette() {
  const categories = Array.from(new Set(componentDefinitions.map(c => c.category)));

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {category}
          </h3>
          <div className="space-y-2">
            {componentDefinitions
              .filter(c => c.category === category)
              .map(component => (
                <DraggableComponent key={component.type} component={component} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
