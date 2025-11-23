import { useState } from 'react';
import { Node } from 'reactflow';
import { X, Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface EntityPanelProps {
  node: Node;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

const FIELD_TYPES = [
  'String',
  'Int',
  'Float',
  'Boolean',
  'DateTime',
  'Json',
  'Bytes',
];

export function EntityPanel({ node, onUpdate, onDelete, onClose }: EntityPanelProps) {
  const [entityName, setEntityName] = useState(node.data.label);
  const [fields, setFields] = useState(node.data.fields || []);

  const addField = () => {
    const newField = {
      id: nanoid(),
      name: `field${fields.length + 1}`,
      type: 'String',
      isRequired: false,
      isUnique: false,
      isId: false,
      defaultValue: '',
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const deleteField = (index: number) => {
    const newFields = fields.filter((_: any, i: number) => i !== index);
    setFields(newFields);
  };

  const handleSave = () => {
    onUpdate({
      label: entityName,
      fields,
    });
    onClose();
  };

  return (
    <div className="w-96 border-l border-border bg-card h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Edit Entity</h3>
        <button onClick={onClose} className="p-1 hover:bg-accent rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Entity Name */}
        <div>
          <label className="text-sm font-medium block mb-2">Entity Name</label>
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., User, Post, Product"
          />
        </div>

        {/* Fields */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Fields</label>
            <button
              onClick={addField}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Field
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field: any, index: number) => (
              <div key={field.id} className="p-3 border border-border rounded space-y-2">
                {/* Field Name and Type */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Field name"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                    className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteField(index)}
                    className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.isId}
                      onChange={(e) => updateField(index, { isId: e.target.checked })}
                      className="cursor-pointer"
                    />
                    <span>ID</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => updateField(index, { isRequired: e.target.checked })}
                      className="cursor-pointer"
                    />
                    <span>Required</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.isUnique}
                      onChange={(e) => updateField(index, { isUnique: e.target.checked })}
                      className="cursor-pointer"
                    />
                    <span>Unique</span>
                  </label>
                </div>

                {/* Default Value */}
                <input
                  type="text"
                  value={field.defaultValue || ''}
                  onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Default value (optional)"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Save Changes
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
