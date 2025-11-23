import {
  Play,
  Zap,
  GitBranch,
  Globe,
  RepeatIcon,
  Code,
  Download,
} from 'lucide-react';

interface WorkflowToolbarProps {
  onAddNode: (type: string) => void;
  onGenerateCode: () => void;
}

export function WorkflowToolbar({ onAddNode, onGenerateCode }: WorkflowToolbarProps) {
  const nodeTypes = [
    { type: 'trigger', label: 'Trigger', icon: Zap },
    { type: 'condition', label: 'Condition', icon: GitBranch },
    { type: 'apiCall', label: 'API Call', icon: Globe },
    { type: 'loop', label: 'Loop', icon: RepeatIcon },
    { type: 'customCode', label: 'Custom Code', icon: Code },
  ];

  return (
    <div className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
      {/* Node Types */}
      <div className="flex gap-2">
        <span className="text-sm text-muted-foreground mr-2 flex items-center">Add Node:</span>
        {nodeTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className="px-3 py-2 text-sm border border-border rounded hover:bg-accent flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onGenerateCode}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Generate Code
        </button>
      </div>
    </div>
  );
}
