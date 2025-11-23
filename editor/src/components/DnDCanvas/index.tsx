import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import { ComponentRenderer } from './ComponentRenderer';
import { DropZone } from './DropZone';

export function DnDCanvas() {
  const { components, addComponent, moveComponent } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Adding new component from palette
    if (activeData?.fromPalette) {
      const newComponent = {
        type: activeData.type,
        name: activeData.type,
        parentId: overData?.componentId || null,
        props: getDefaultProps(activeData.type),
        children: [],
        order: overData?.order || 0,
      };

      addComponent(newComponent);
    }
    // Moving existing component
    else if (activeData?.componentId) {
      moveComponent(
        activeData.componentId,
        overData?.componentId || null,
        overData?.order || 0
      );
    }
  };

  const rootComponents = components.filter(c => c.parentId === null);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full overflow-auto bg-muted/20 p-8">
        <div className="max-w-6xl mx-auto bg-background rounded-lg shadow-lg min-h-[800px]">
          <DropZone componentId={null}>
            {rootComponents.length === 0 ? (
              <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">Drop components here to start building</p>
                  <p className="text-sm">Drag components from the left panel</p>
                </div>
              </div>
            ) : (
              rootComponents.map((component, index) => (
                <ComponentRenderer key={component.id} component={component} />
              ))
            )}
          </DropZone>
        </div>
      </div>
      <DragOverlay />
    </DndContext>
  );
}

function getDefaultProps(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    Container: {
      className: 'flex flex-col gap-4 p-4',
    },
    Box: {
      className: 'p-4 border border-gray-200 rounded',
    },
    Text: {
      content: 'Text',
      className: 'text-base',
    },
    Heading: {
      content: 'Heading',
      level: 1,
      className: 'text-2xl font-bold',
    },
    Button: {
      content: 'Button',
      variant: 'primary',
      className: 'px-4 py-2 bg-blue-500 text-white rounded',
    },
    Input: {
      type: 'text',
      placeholder: 'Enter text...',
      className: 'px-3 py-2 border border-gray-300 rounded',
    },
    Image: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder',
      className: 'w-full h-auto',
    },
    List: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      className: 'list-disc list-inside',
    },
    Table: {
      columns: ['Column 1', 'Column 2'],
      rows: [
        ['Data 1', 'Data 2'],
        ['Data 3', 'Data 4'],
      ],
      className: 'w-full border-collapse',
    },
  };

  return defaults[type] || {};
}
