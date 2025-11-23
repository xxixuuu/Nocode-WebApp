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
    // Layout Components
    case 'Container':
      return <div className={className}>{/* children will be rendered below */}</div>;

    case 'Box':
      return <div className={className}>{/* children will be rendered below */}</div>;

    case 'Flex':
      return <div className={`flex ${className}`}>{/* children will be rendered below */}</div>;

    case 'Grid':
      return <div className={`grid ${className}`}>{/* children will be rendered below */}</div>;

    case 'Stack':
      return <div className={`flex ${props.direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className}`}>{/* children will be rendered below */}</div>;

    // Typography Components
    case 'Text':
      return <p className={className}>{props.content || 'Text'}</p>;

    case 'Heading':
      const HeadingTag = `h${props.level || 1}` as keyof JSX.IntrinsicElements;
      return <HeadingTag className={className}>{props.content || 'Heading'}</HeadingTag>;

    case 'Paragraph':
      return <p className={className}>{props.content || 'Paragraph text'}</p>;

    case 'Link':
      return <a href={props.href || '#'} className={className}>{props.content || 'Link'}</a>;

    // Form Components
    case 'Input':
      return <input type={props.type || 'text'} placeholder={props.placeholder} className={className} />;

    case 'Button':
      return <button className={className} type={props.type || 'button'}>{props.content || 'Button'}</button>;

    case 'TextArea':
      return <textarea placeholder={props.placeholder} rows={props.rows || 4} className={className} />;

    case 'Select':
      return (
        <select className={className}>
          {props.options?.map((option: string, index: number) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      );

    case 'Checkbox':
      return (
        <label className={`flex items-center gap-2 ${className}`}>
          <input type="checkbox" />
          <span>{props.label || 'Checkbox'}</span>
        </label>
      );

    case 'Radio':
      return (
        <label className={`flex items-center gap-2 ${className}`}>
          <input type="radio" name={props.name} />
          <span>{props.label || 'Radio'}</span>
        </label>
      );

    case 'Switch':
      return (
        <label className={`flex items-center gap-2 ${className}`}>
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span>{props.label || 'Switch'}</span>
        </label>
      );

    case 'Form':
      return <form className={className}>{/* children will be rendered below */}</form>;

    case 'Label':
      return <label className={className}>{props.content || 'Label'}</label>;

    // Data Components
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

    case 'List':
      return (
        <ul className={className}>
          {props.items?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'Card':
      return (
        <div className={`border rounded-lg shadow ${className}`}>
          <div className="p-4">
            {props.title && <h3 className="text-lg font-semibold mb-2">{props.title}</h3>}
            {props.content && <p>{props.content}</p>}
            {/* children will be rendered below */}
          </div>
        </div>
      );

    case 'Badge':
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
          {props.content || 'Badge'}
        </span>
      );

    // Media Components
    case 'Image':
      return <img src={props.src || 'https://via.placeholder.com/150'} alt={props.alt || 'Image'} className={className} />;

    case 'Video':
      return (
        <video controls className={className}>
          <source src={props.src} type={props.type || 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      );

    case 'Icon':
      return <span className={`inline-block ${className}`}>{props.name || '★'}</span>;

    // Navigation Components
    case 'Navbar':
      return (
        <nav className={`flex items-center justify-between p-4 ${className}`}>
          <div className="font-bold">{props.brand || 'Brand'}</div>
          <div className="flex gap-4">
            {props.links?.map((link: string, index: number) => (
              <a key={index} href="#" className="hover:underline">{link}</a>
            ))}
          </div>
        </nav>
      );

    case 'Sidebar':
      return (
        <aside className={`w-64 p-4 border-r ${className}`}>
          {props.items?.map((item: string, index: number) => (
            <div key={index} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">{item}</div>
          ))}
        </aside>
      );

    case 'Breadcrumb':
      return (
        <nav className={className}>
          <ol className="flex items-center gap-2">
            {props.items?.map((item: string, index: number) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <a href="#" className={index === props.items.length - 1 ? 'font-semibold' : 'text-blue-600 hover:underline'}>
                  {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      );

    case 'Tabs':
      return (
        <div className={className}>
          <div className="flex border-b">
            {props.tabs?.map((tab: string, index: number) => (
              <button
                key={index}
                className={`px-4 py-2 ${index === 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">{/* children will be rendered below */}</div>
        </div>
      );

    // Feedback Components
    case 'Alert':
      const alertColors = {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        error: 'bg-red-50 text-red-800 border-red-200',
      };
      const alertColor = alertColors[props.variant as keyof typeof alertColors] || alertColors.info;
      return (
        <div className={`border rounded p-4 ${alertColor} ${className}`}>
          {props.title && <div className="font-semibold mb-1">{props.title}</div>}
          <div>{props.content || 'Alert message'}</div>
        </div>
      );

    case 'Toast':
      return (
        <div className={`fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg ${className}`}>
          {props.content || 'Toast notification'}
        </div>
      );

    case 'Modal':
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full ${className}`}>
            {props.title && <h2 className="text-xl font-semibold mb-4">{props.title}</h2>}
            <div>{props.content || 'Modal content'}</div>
            {/* children will be rendered below */}
          </div>
        </div>
      );

    case 'Spinner':
      return (
        <div className={`inline-block animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${props.size || 'h-8 w-8'} ${className}`}></div>
      );

    case 'Progress':
      return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${props.value || 0}%` }}
          ></div>
        </div>
      );

    default:
      return <div className={className}>Unknown component: {type}</div>;
  }
}
