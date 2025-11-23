import { useState } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useWorkflowStore } from '../../store/workflowStore';

interface WorkflowCodePreviewProps {
  onClose: () => void;
}

export function WorkflowCodePreview({ onClose }: WorkflowCodePreviewProps) {
  const { generateTypeScriptCode } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  const [functionName, setFunctionName] = useState('handleWorkflow');

  const code = generateTypeScriptCode(functionName);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${functionName}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Generated TypeScript Function</h2>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Function Name:</label>
              <input
                type="text"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                className="px-2 py-1 border border-border rounded text-sm"
                placeholder="handleWorkflow"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-accent">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language="typescript"
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/50 text-sm text-muted-foreground">
          <p>
            This function can be used in your application. Copy it to <code className="px-1 py-0.5 bg-muted rounded">lib/workflows.ts</code> or use in event handlers.
          </p>
        </div>
      </div>
    </div>
  );
}
