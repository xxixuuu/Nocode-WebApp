import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import { Component } from '../../types';
import { DropZone } from './DropZone';

interface ComponentRendererProps {
  component: Component;
}

export function ComponentRenderer({ component }: ComponentRendererProps) {
  const { selectedComponentId, selectComponent, getComponentChildren } = useEditorStore();
  const isSelected = selectedComponentId === component.id;

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: {
      componentId: component.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const children = getComponentChildren(component.id);

  return (
    <div
      ref={setDragRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      className={`relative ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      {...listeners}
      {...attributes}
    >
      {/* Component Badge */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
          {component.type}
        </div>
      )}

      {/* Render Component */}
      {renderComponent(component)}

      {/* Children */}
      {children.length > 0 && (
        <DropZone componentId={component.id}>
          {children.map((child) => (
            <ComponentRenderer key={child.id} component={child} />
          ))}
        </DropZone>
      )}
    </div>
  );
}

function renderComponent(component: Component) {
  const { type, props } = component;
  const className = props.className || '';

  switch (type) {
    case 'Container':
      return <div className={className}>{/* children will be rendered below */}</div>;

    case 'Box':
      return <div className={className}>{/* children will be rendered below */}</div>;

    case 'Text':
      return <p className={className}>{props.content}</p>;

    case 'Heading':
      const HeadingTag = `h${props.level || 1}` as keyof JSX.IntrinsicElements;
      return <HeadingTag className={className}>{props.content}</HeadingTag>;

    case 'Button':
      return <button className={className}>{props.content}</button>;

    case 'Input':
      return <input type={props.type} placeholder={props.placeholder} className={className} />;

    case 'Image':
      return <img src={props.src} alt={props.alt} className={className} />;

    case 'List':
      return (
        <ul className={className}>
          {props.items?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'Table':
      return (
        <table className={className}>
          <thead>
            <tr>
              {props.columns?.map((col: string, index: number) => (
                <th key={index} className="border px-4 py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows?.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    default:
      return <div className={className}>Unknown component: {type}</div>;
  }
}
