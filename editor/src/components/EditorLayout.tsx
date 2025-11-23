import { useState } from 'react';
import { ComponentPalette } from './ComponentPalette';
import { DnDCanvas } from './DnDCanvas';
import { PropertyPanel } from './PropertyPanel';
import { CodePreview } from './CodePreview';
import { DataModeler } from './DataModeler';
import { WorkflowBuilder } from './WorkflowBuilder';
import { Toolbar } from './Toolbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';

type ViewMode = 'design' | 'data' | 'workflow' | 'preview';

export function EditorLayout() {
  const [viewMode, setViewMode] = useState<ViewMode>('design');

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Component Palette (only in design mode) */}
      {viewMode === 'design' && (
        <aside className="w-64 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Components</h2>
          </div>
          <ComponentPalette />
        </aside>
      )}

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <Toolbar onViewModeChange={setViewMode} currentMode={viewMode} />

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="h-full">
            <TabsContent value="design" className="h-full m-0">
              <DnDCanvas />
            </TabsContent>
            <TabsContent value="data" className="h-full m-0">
              <DataModeler />
            </TabsContent>
            <TabsContent value="workflow" className="h-full m-0">
              <WorkflowBuilder />
            </TabsContent>
            <TabsContent value="preview" className="h-full m-0">
              <CodePreview />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Right Sidebar - Properties (only in design mode) */}
      {viewMode === 'design' && (
        <aside className="w-80 border-l border-border bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Properties</h2>
          </div>
          <PropertyPanel />
        </aside>
      )}
    </div>
  );
}
