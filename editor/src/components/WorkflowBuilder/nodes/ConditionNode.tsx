import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="bg-card border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px]">
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <GitBranch className="w-4 h-4" />
        <span className="font-semibold">Condition</span>
      </div>
      <div className="p-4">
        <div className="text-sm">
          <span className="text-muted-foreground">If:</span>
          <div className="mt-1 p-2 bg-muted rounded font-mono text-xs">
            {data.expression || 'value > 0'}
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 left-1/4" />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 left-3/4" />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
