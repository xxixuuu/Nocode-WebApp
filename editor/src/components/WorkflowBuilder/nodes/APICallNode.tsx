import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe } from 'lucide-react';

export const APICallNode = memo(({ data }: NodeProps) => {
  return (
    <div className="bg-card border-2 border-green-500 rounded-lg shadow-lg min-w-[200px]">
      <div className="bg-green-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Globe className="w-4 h-4" />
        <span className="font-semibold">API Call</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="text-sm">
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
            {data.method || 'GET'}
          </span>
        </div>
        <div className="text-xs font-mono text-muted-foreground truncate">
          {data.url || '/api/endpoint'}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

APICallNode.displayName = 'APICallNode';
