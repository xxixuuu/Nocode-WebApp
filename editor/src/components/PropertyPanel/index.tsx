import { useEditorStore } from '../../store/editorStore';
import { Trash2 } from 'lucide-react';

export function PropertyPanel() {
  const { selectedComponentId, getComponentById, updateComponent, deleteComponent } =
    useEditorStore();

  const component = selectedComponentId ? getComponentById(selectedComponentId) : null;

  if (!component) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Select a component to edit its properties</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateComponent(component.id, {
      props: {
        ...component.props,
        [key]: value,
      },
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    updateComponent(component.id, {
      styles: {
        ...component.styles,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {/* Component Info */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{component.type}</h3>
          <button
            onClick={() => deleteComponent(component.id)}
            className="p-2 hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
            title="Delete component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">ID: {component.id}</p>
      </div>

      {/* Properties */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Properties</h4>
        <div className="space-y-4">
          {renderPropertiesForType(component.type, component.props, handlePropChange)}
        </div>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Styles</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">CSS Classes</label>
            <input
              type="text"
              value={component.props.className || ''}
              onChange={(e) => handlePropChange('className', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., flex gap-4 p-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPropertiesForType(
  type: string,
  props: Record<string, any>,
  onChange: (key: string, value: any) => void
) {
  switch (type) {
    case 'Text':
    case 'Heading':
      return (
        <>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Content</label>
            <input
              type="text"
              value={props.content || ''}
              onChange={(e) => onChange('content', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {type === 'Heading' && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Level</label>
              <select
                value={props.level || 1}
                onChange={(e) => onChange('level', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>
                    H{level}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      );

    case 'Button':
      return (
        <>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Text</label>
            <input
              type="text"
              value={props.content || ''}
              onChange={(e) => onChange('content', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Variant</label>
            <select
              value={props.variant || 'primary'}
              onChange={(e) => onChange('variant', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </>
      );

    case 'Input':
      return (
        <>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Type</label>
            <select
              value={props.type || 'text'}
              onChange={(e) => onChange('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
              <option value="number">Number</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Placeholder</label>
            <input
              type="text"
              value={props.placeholder || ''}
              onChange={(e) => onChange('placeholder', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      );

    case 'Image':
      return (
        <>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Source URL</label>
            <input
              type="text"
              value={props.src || ''}
              onChange={(e) => onChange('src', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Alt Text</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => onChange('alt', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </>
      );

    default:
      return <p className="text-xs text-muted-foreground">No editable properties</p>;
  }
}
