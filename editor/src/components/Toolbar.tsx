import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import {
  Undo2,
  Redo2,
  Save,
  Eye,
  Code,
  Database,
  Workflow,
  Download,
  Play,
  Rocket,
} from 'lucide-react';
import { DeploymentModal } from './Deployment/DeploymentModal';

interface ToolbarProps {
  onViewModeChange: (mode: 'design' | 'data' | 'workflow' | 'preview') => void;
  currentMode: string;
}

export function Toolbar({ onViewModeChange, currentMode }: ToolbarProps) {
  const { undo, redo, historyIndex, history, components } = useEditorStore();
  const [showDeployment, setShowDeployment] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Left - History Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        <button
          className="p-2 rounded hover:bg-accent"
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Center - View Mode Switcher */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('design')}
          className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
            currentMode === 'design' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          Design
        </button>
        <button
          onClick={() => onViewModeChange('data')}
          className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
            currentMode === 'data' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <Database className="w-4 h-4" />
          Data
        </button>
        <button
          onClick={() => onViewModeChange('workflow')}
          className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
            currentMode === 'workflow' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <Workflow className="w-4 h-4" />
          Workflow
        </button>
        <button
          onClick={() => onViewModeChange('preview')}
          className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
            currentMode === 'preview' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <Code className="w-4 h-4" />
          Code
        </button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 rounded hover:bg-accent flex items-center gap-2 text-sm">
          <Play className="w-4 h-4" />
          Preview
        </button>
        <button className="px-4 py-2 rounded hover:bg-accent flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" />
          Export Code
        </button>
        <button
          onClick={() => setShowDeployment(true)}
          className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 text-sm font-medium"
        >
          <Rocket className="w-4 h-4" />
          Deploy
        </button>
      </div>

      {/* Deployment Modal */}
      {showDeployment && (
        <DeploymentModal
          onClose={() => setShowDeployment(false)}
          projectData={{ components }}
        />
      )}
    </div>
  );
}
