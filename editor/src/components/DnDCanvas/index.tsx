import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import { ComponentRenderer } from './ComponentRenderer';
import { DropZone } from './DropZone';
import { componentDefinitions } from '../../lib/componentDefinitions';

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
  const definition = componentDefinitions.find(c => c.type === type);
  return definition?.defaultProps || {};
}
