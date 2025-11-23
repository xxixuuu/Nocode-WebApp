import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Edit2 } from 'lucide-react';

export const EntityNode = memo(({ data, id }: NodeProps) => {
  return (
    <div className="bg-card border-2 border-primary rounded-lg shadow-lg min-w-[250px]">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="font-semibold">{data.label}</span>
        </div>
        <button
          onClick={() => data.onEdit?.(id)}
          className="p-1 hover:bg-primary-foreground/20 rounded"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>

      {/* Fields */}
      <div className="p-2">
        {data.fields?.map((field: any, index: number) => (
          <div
            key={field.id}
            className="px-3 py-2 text-sm border-b border-border last:border-0 flex items-center justify-between hover:bg-accent/50"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {field.isId && '🔑 '}
                {field.isUnique && '⚡ '}
              </span>
              <span className="font-medium">{field.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{field.type}</span>
          </div>
        ))}
      </div>

      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
