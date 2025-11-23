import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

export const TriggerNode = memo(({ data }: NodeProps) => {
  return (
    <div className="bg-card border-2 border-yellow-500 rounded-lg shadow-lg min-w-[200px]">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <span className="font-semibold">Trigger</span>
      </div>
      <div className="p-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Event:</span>
          <span className="ml-2 font-mono">{data.event || 'onClick'}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
