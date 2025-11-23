export interface Component {
  id: string;
  type: string;
  name: string;
  parentId: string | null;
  props: Record<string, any>;
  styles?: Record<string, any>;
  events?: Record<string, string>;
  children: string[];
  order: number;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  layout: Component[];
  metadata?: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  framework: 'nextjs' | 'vite-react' | 'svelte';
  status: 'draft' | 'building' | 'deployed' | 'failed';
  pages: Page[];
  schemas: Schema[];
  workflows: Workflow[];
  createdAt: string;
  updatedAt: string;
}

export interface Schema {
  id: string;
  name: string;
  fields: SchemaField[];
}

export interface SchemaField {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  defaultValue?: string;
  validationRules?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'apiCall' | 'loop' | 'customCode';
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface EditorState {
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  clipboard: Component | null;
  history: Component[][];
  historyIndex: number;
}

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: 'layout' | 'form' | 'data' | 'media' | 'custom';
  defaultProps: Record<string, any>;
  propSchema: Record<string, PropertySchema>;
}

export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'json';
  label: string;
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
