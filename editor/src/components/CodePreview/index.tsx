import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';
import { Copy, Download } from 'lucide-react';

export function CodePreview() {
  const { components } = useEditorStore();
  const [language, setLanguage] = useState<'tsx' | 'html'>('tsx');

  const generatedCode = language === 'tsx' ? generateReactCode(components) : generateHTMLCode(components);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = language === 'tsx' ? 'Component.tsx' : 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('tsx')}
            className={`px-3 py-1.5 text-sm rounded ${
              language === 'tsx' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            React (TSX)
          </button>
          <button
            onClick={() => setLanguage('html')}
            className={`px-3 py-1.5 text-sm rounded ${
              language === 'html' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            HTML
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm rounded hover:bg-accent flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language === 'tsx' ? 'typescript' : 'html'}
          value={generatedCode}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

function generateReactCode(components: any[]): string {
  const rootComponents = components.filter(c => c.parentId === null);

  if (rootComponents.length === 0) {
    return `export default function Component() {\n  return (\n    <div>No components yet</div>\n  );\n}`;
  }

  const componentCode = rootComponents.map(c => generateComponentJSX(c, components, 2)).join('\n');

  return `export default function Component() {
  return (
    <>
${componentCode}
    </>
  );
}`;
}

function generateComponentJSX(component: any, allComponents: any[], indent: number): string {
  const spaces = ' '.repeat(indent);
  const { type, props, children } = component;
  const className = props.className ? ` className="${props.className}"` : '';

  const childComponents = children
    .map((childId: string) => allComponents.find(c => c.id === childId))
    .filter(Boolean);

  const hasChildren = childComponents.length > 0 || hasTextContent(type, props);

  switch (type) {
    case 'Container':
    case 'Box':
      if (hasChildren) {
        const childrenCode = childComponents
          .map((child: any) => generateComponentJSX(child, allComponents, indent + 2))
          .join('\n');
        return `${spaces}<div${className}>\n${childrenCode}\n${spaces}</div>`;
      }
      return `${spaces}<div${className} />`;

    case 'Text':
      return `${spaces}<p${className}>${props.content || ''}</p>`;

    case 'Heading':
      const level = props.level || 1;
      return `${spaces}<h${level}${className}>${props.content || ''}</h${level}>`;

    case 'Button':
      return `${spaces}<button${className}>${props.content || 'Button'}</button>`;

    case 'Input':
      return `${spaces}<input type="${props.type || 'text'}" placeholder="${props.placeholder || ''}"${className} />`;

    case 'Image':
      return `${spaces}<img src="${props.src || ''}" alt="${props.alt || ''}"${className} />`;

    default:
      return `${spaces}<div${className}>{/* ${type} */}</div>`;
  }
}

function generateHTMLCode(components: any[]): string {
  const rootComponents = components.filter(c => c.parentId === null);

  if (rootComponents.length === 0) {
    return '<!-- No components yet -->';
  }

  const bodyContent = rootComponents.map(c => generateComponentHTML(c, components, 2)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

function generateComponentHTML(component: any, allComponents: any[], indent: number): string {
  const spaces = ' '.repeat(indent);
  const { type, props, children } = component;
  const className = props.className ? ` class="${props.className}"` : '';

  const childComponents = children
    .map((childId: string) => allComponents.find(c => c.id === childId))
    .filter(Boolean);

  const hasChildren = childComponents.length > 0 || hasTextContent(type, props);

  switch (type) {
    case 'Container':
    case 'Box':
      if (hasChildren) {
        const childrenCode = childComponents
          .map((child: any) => generateComponentHTML(child, allComponents, indent + 2))
          .join('\n');
        return `${spaces}<div${className}>\n${childrenCode}\n${spaces}</div>`;
      }
      return `${spaces}<div${className}></div>`;

    case 'Text':
      return `${spaces}<p${className}>${props.content || ''}</p>`;

    case 'Heading':
      const level = props.level || 1;
      return `${spaces}<h${level}${className}>${props.content || ''}</h${level}>`;

    case 'Button':
      return `${spaces}<button${className}>${props.content || 'Button'}</button>`;

    case 'Input':
      return `${spaces}<input type="${props.type || 'text'}" placeholder="${props.placeholder || ''}"${className}>`;

    case 'Image':
      return `${spaces}<img src="${props.src || ''}" alt="${props.alt || ''}"${className}>`;

    default:
      return `${spaces}<div${className}><!-- ${type} --></div>`;
  }
}

function hasTextContent(type: string, props: any): boolean {
  return ['Text', 'Heading', 'Button'].includes(type) && props.content;
}
