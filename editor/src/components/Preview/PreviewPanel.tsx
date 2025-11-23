import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Code, Eye, Copy, Check, Download } from 'lucide-react';
import { CodeGenerator } from '../../lib/codeGenerator';
import Editor from '@monaco-editor/react';
import { Component } from '../../types';

export function PreviewPanel() {
  const { components } = useEditorStore();
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState(false);

  const generatedCode = CodeGenerator.generateReactComponent(components, 'Preview');

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Preview.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview Toolbar */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
              viewMode === 'visual' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <Eye className="w-4 h-4" />
            Visual
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded flex items-center gap-2 text-sm ${
              viewMode === 'code' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        {viewMode === 'code' && (
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
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-background">
        {viewMode === 'visual' ? (
          <div className="min-h-full">
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No components to preview</p>
                  <p className="text-sm mt-2">Add components to see the preview</p>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <PreviewRenderer components={components} />
              </div>
            )}
          </div>
        ) : (
          <Editor
            height="100%"
            language="typescript"
            value={generatedCode}
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
        )}
      </div>
    </div>
  );
}

/**
 * Component that renders the visual preview
 */
function PreviewRenderer({ components }: { components: Component[] }) {
  return (
    <>
      {components.map((component) => (
        <ComponentPreview key={component.id} component={component} />
      ))}
    </>
  );
}

/**
 * Render individual component in preview mode
 */
function ComponentPreview({ component }: { component: Component }) {
  const { type, props } = component;
  const className = props.className || '';

  switch (type) {
    case 'Container':
    case 'Box':
      return <div className={className}>{renderChildren(component)}</div>;

    case 'Flex':
      return <div className={`flex ${className}`}>{renderChildren(component)}</div>;

    case 'Grid':
      return <div className={`grid ${className}`}>{renderChildren(component)}</div>;

    case 'Stack':
      return (
        <div className={`flex ${props.direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className}`}>
          {renderChildren(component)}
        </div>
      );

    case 'Text':
    case 'Paragraph':
      return <p className={className}>{props.content || 'Text'}</p>;

    case 'Heading':
      const HeadingTag = `h${props.level || 1}` as keyof JSX.IntrinsicElements;
      return <HeadingTag className={className}>{props.content || 'Heading'}</HeadingTag>;

    case 'Link':
      return (
        <a href={props.href || '#'} className={className}>
          {props.content || 'Link'}
        </a>
      );

    case 'Button':
      return (
        <button className={className} type={props.type || 'button'}>
          {props.content || 'Button'}
        </button>
      );

    case 'Input':
      return <input type={props.type || 'text'} placeholder={props.placeholder} className={className} />;

    case 'TextArea':
      return <textarea placeholder={props.placeholder} rows={props.rows || 4} className={className} />;

    case 'Select':
      return (
        <select className={className}>
          {props.options?.map((option: string, index: number) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'Checkbox':
      return (
        <label className={`flex items-center gap-2 ${className}`}>
          <input type="checkbox" />
          <span>{props.label || 'Checkbox'}</span>
        </label>
      );

    case 'Radio':
      return (
        <label className={`flex items-center gap-2 ${className}`}>
          <input type="radio" name={props.name} />
          <span>{props.label || 'Radio'}</span>
        </label>
      );

    case 'Switch':
      return (
        <label className={`flex items-center gap-2 ${className}`}>
          <input type="checkbox" className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span>{props.label || 'Switch'}</span>
        </label>
      );

    case 'Form':
      return <form className={className}>{renderChildren(component)}</form>;

    case 'Label':
      return <label className={className}>{props.content || 'Label'}</label>;

    case 'Table':
      return (
        <table className={className}>
          <thead>
            <tr>
              {props.columns?.map((col: string, index: number) => (
                <th key={index} className="border px-4 py-2">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows?.map((row: string[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case 'List':
      return (
        <ul className={className}>
          {props.items?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'Card':
      return (
        <div className={`border rounded-lg shadow ${className}`}>
          <div className="p-4">
            {props.title && <h3 className="text-lg font-semibold mb-2">{props.title}</h3>}
            {props.content && <p>{props.content}</p>}
            {renderChildren(component)}
          </div>
        </div>
      );

    case 'Badge':
      return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>{props.content || 'Badge'}</span>;

    case 'Image':
      return <img src={props.src || 'https://via.placeholder.com/150'} alt={props.alt || 'Image'} className={className} />;

    case 'Video':
      return (
        <video controls className={className}>
          <source src={props.src} type={props.type || 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      );

    case 'Icon':
      return <span className={`inline-block ${className}`}>{props.name || '★'}</span>;

    case 'Navbar':
      return (
        <nav className={`flex items-center justify-between p-4 ${className}`}>
          <div className="font-bold">{props.brand || 'Brand'}</div>
          <div className="flex gap-4">
            {props.links?.map((link: string, index: number) => (
              <a key={index} href="#" className="hover:underline">
                {link}
              </a>
            ))}
          </div>
        </nav>
      );

    case 'Sidebar':
      return (
        <aside className={`w-64 p-4 border-r ${className}`}>
          {props.items?.map((item: string, index: number) => (
            <div key={index} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
              {item}
            </div>
          ))}
        </aside>
      );

    case 'Breadcrumb':
      return (
        <nav className={className}>
          <ol className="flex items-center gap-2">
            {props.items?.map((item: string, index: number) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <a href="#" className={index === props.items.length - 1 ? 'font-semibold' : 'text-blue-600 hover:underline'}>
                  {item}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      );

    case 'Tabs':
      return (
        <div className={className}>
          <div className="flex border-b">
            {props.tabs?.map((tab: string, index: number) => (
              <button key={index} className={`px-4 py-2 ${index === 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">{renderChildren(component)}</div>
        </div>
      );

    case 'Alert':
      const alertColors = {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        error: 'bg-red-50 text-red-800 border-red-200',
      };
      const alertColor = alertColors[props.variant as keyof typeof alertColors] || alertColors.info;
      return (
        <div className={`border rounded p-4 ${alertColor} ${className}`}>
          {props.title && <div className="font-semibold mb-1">{props.title}</div>}
          <div>{props.content || 'Alert message'}</div>
        </div>
      );

    case 'Toast':
      return <div className={`fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg ${className}`}>{props.content || 'Toast notification'}</div>;

    case 'Modal':
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full ${className}`}>
            {props.title && <h2 className="text-xl font-semibold mb-4">{props.title}</h2>}
            <div>
              {props.content || 'Modal content'}
              {renderChildren(component)}
            </div>
          </div>
        </div>
      );

    case 'Spinner':
      return <div className={`inline-block animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${props.size || 'h-8 w-8'} ${className}`}></div>;

    case 'Progress':
      return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${props.value || 0}%` }}></div>
        </div>
      );

    default:
      return <div className={className}>Unknown component: {type}</div>;
  }
}

function renderChildren(component: Component) {
  const children = component.children || [];
  return children.map((child) => <ComponentPreview key={child.id} component={child} />);
}
