import { useState } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useDataModelStore } from '../../store/dataModelStore';

interface CodePreviewModalProps {
  type: 'prisma' | 'api';
  onClose: () => void;
}

export function CodePreviewModal({ type, onClose }: CodePreviewModalProps) {
  const { generatePrismaSchema, generateAPIRoutes } = useDataModelStore();
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const prismaSchema = type === 'prisma' ? generatePrismaSchema() : '';
  const apiRoutes = type === 'api' ? generateAPIRoutes() : {};
  const fileNames = type === 'api' ? Object.keys(apiRoutes) : [];

  const currentCode = type === 'prisma'
    ? prismaSchema
    : (selectedFile ? apiRoutes[selectedFile] : fileNames.length > 0 ? apiRoutes[fileNames[0]] : '');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fileName = type === 'prisma' ? 'schema.prisma' : selectedFile;
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (type === 'api') {
      // Create a zip-like structure (simplified - just download all files)
      for (const [fileName, code] of Object.entries(apiRoutes)) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.split('/').pop() || fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {type === 'prisma' ? 'Prisma Schema' : 'API Routes'}
            </h2>

            {/* File Selector for API Routes */}
            {type === 'api' && fileNames.length > 0 && (
              <select
                value={selectedFile || fileNames[0]}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="px-3 py-1 border border-border rounded text-sm"
              >
                {fileNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
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
              onClick={handleDownloadAll}
              className="px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {type === 'api' ? 'All' : ''}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={type === 'prisma' ? 'prisma' : 'typescript'}
            value={currentCode}
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
          {type === 'prisma' ? (
            <p>Copy this schema to <code className="px-1 py-0.5 bg-muted rounded">prisma/schema.prisma</code></p>
          ) : (
            <p>Generated {fileNames.length} API route{fileNames.length !== 1 ? 's' : ''} with full CRUD operations</p>
          )}
        </div>
      </div>
    </div>
  );
}
