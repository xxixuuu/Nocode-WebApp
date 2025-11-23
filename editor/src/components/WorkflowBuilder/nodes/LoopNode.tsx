import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RepeatIcon } from 'lucide-react';

export const LoopNode = memo(({ data }: NodeProps) => {
  return (
    <div className="bg-card border-2 border-purple-500 rounded-lg shadow-lg min-w-[200px]">
      <div className="bg-purple-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <RepeatIcon className="w-4 h-4" />
        <span className="font-semibold">Loop</span>
      </div>
      <div className="p-4">
        <div className="text-sm">
          <span className="text-muted-foreground">For each in:</span>
          <div className="mt-1 p-2 bg-muted rounded font-mono text-xs">
            {data.array || 'items'}
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

LoopNode.displayName = 'LoopNode';
