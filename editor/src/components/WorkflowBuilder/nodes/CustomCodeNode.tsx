import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Code } from 'lucide-react';

export const CustomCodeNode = memo(({ data }: NodeProps) => {
  return (
    <div className="bg-card border-2 border-orange-500 rounded-lg shadow-lg min-w-[250px]">
      <div className="bg-orange-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Code className="w-4 h-4" />
        <span className="font-semibold">Custom Code</span>
      </div>
      <div className="p-4">
        <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded max-h-20 overflow-hidden">
          {data.code?.split('\n').slice(0, 3).join('\n') || '// Custom code...'}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

CustomCodeNode.displayName = 'CustomCodeNode';
