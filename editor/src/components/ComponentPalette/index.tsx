import { useDraggable } from '@dnd-kit/core';
import {
  LayoutGrid,
  Type,
  MousePointer,
  Square,
  Image,
  List,
  Table,
  FormInput,
} from 'lucide-react';

interface ComponentDefinition {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const components: ComponentDefinition[] = [
  // Layout
  { type: 'Container', label: 'Container', icon: <LayoutGrid className="w-4 h-4" />, category: 'Layout' },
  { type: 'Box', label: 'Box', icon: <Square className="w-4 h-4" />, category: 'Layout' },

  // Typography
  { type: 'Text', label: 'Text', icon: <Type className="w-4 h-4" />, category: 'Typography' },
  { type: 'Heading', label: 'Heading', icon: <Type className="w-4 h-4" />, category: 'Typography' },

  // Form
  { type: 'Input', label: 'Input', icon: <FormInput className="w-4 h-4" />, category: 'Form' },
  { type: 'Button', label: 'Button', icon: <MousePointer className="w-4 h-4" />, category: 'Form' },

  // Data
  { type: 'List', label: 'List', icon: <List className="w-4 h-4" />, category: 'Data' },
  { type: 'Table', label: 'Table', icon: <Table className="w-4 h-4" />, category: 'Data' },

  // Media
  { type: 'Image', label: 'Image', icon: <Image className="w-4 h-4" />, category: 'Media' },
];

function DraggableComponent({ component }: { component: ComponentDefinition }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent cursor-move transition-colors"
    >
      {component.icon}
      <span className="text-sm font-medium">{component.label}</span>
    </div>
  );
}

export function ComponentPalette() {
  const categories = Array.from(new Set(components.map(c => c.category)));

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {category}
          </h3>
          <div className="space-y-2">
            {components
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
