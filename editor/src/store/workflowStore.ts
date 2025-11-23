import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Node, Edge } from 'reactflow';

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  generateTypeScriptCode: (functionName: string) => string;
}

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    immer((set, get) => ({
      nodes: [],
      edges: [],

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      generateTypeScriptCode: (functionName = 'workflow') => {
        const { nodes, edges } = get();

        if (nodes.length === 0) {
          return '// No workflow nodes defined';
        }

        let code = `/**\n * Generated workflow function\n */\n`;
        code += `export async function ${functionName}(data: any): Promise<any> {\n`;

        // Find trigger node (entry point)
        const triggerNode = nodes.find((n) => n.type === 'trigger');

        if (!triggerNode) {
          code += `  // No trigger node found\n`;
          code += `  return data;\n}\n`;
          return code;
        }

        // Generate code by traversing the flow
        const visited = new Set<string>();
        const indent = '  ';

        function generateNodeCode(nodeId: string, depth: number): string {
          if (visited.has(nodeId)) return '';
          visited.add(nodeId);

          const node = nodes.find((n) => n.id === nodeId);
          if (!node) return '';

          const spaces = indent.repeat(depth);
          let nodeCode = '';

          switch (node.type) {
            case 'trigger':
              nodeCode += `${spaces}// Trigger: ${node.data.event}\n`;
              break;

            case 'condition':
              const expression = node.data.expression || 'true';
              nodeCode += `${spaces}// Condition: ${expression}\n`;
              nodeCode += `${spaces}if (${expression}) {\n`;

              // Find connected nodes
              const trueEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === 'true');
              const falseEdge = edges.find((e) => e.source === nodeId && e.sourceHandle === 'false');

              if (trueEdge) {
                nodeCode += generateNodeCode(trueEdge.target, depth + 1);
              }

              if (falseEdge) {
                nodeCode += `${spaces}} else {\n`;
                nodeCode += generateNodeCode(falseEdge.target, depth + 1);
              }

              nodeCode += `${spaces}}\n`;
              break;

            case 'apiCall':
              const { method = 'GET', url = '/api/endpoint' } = node.data;
              nodeCode += `${spaces}// API Call: ${method} ${url}\n`;
              nodeCode += `${spaces}const response${depth} = await fetch('${url}', {\n`;
              nodeCode += `${spaces}  method: '${method}',\n`;

              if (method !== 'GET' && method !== 'HEAD') {
                nodeCode += `${spaces}  headers: { 'Content-Type': 'application/json' },\n`;
                nodeCode += `${spaces}  body: JSON.stringify(data),\n`;
              }

              nodeCode += `${spaces}});\n`;
              nodeCode += `${spaces}const result${depth} = await response${depth}.json();\n`;
              nodeCode += `${spaces}data = result${depth};\n\n`;
              break;

            case 'loop':
              const array = node.data.array || 'items';
              nodeCode += `${spaces}// Loop: ${array}\n`;
              nodeCode += `${spaces}for (const item of ${array}) {\n`;

              const loopEdge = edges.find((e) => e.source === nodeId);
              if (loopEdge) {
                nodeCode += generateNodeCode(loopEdge.target, depth + 1);
              }

              nodeCode += `${spaces}}\n`;
              break;

            case 'customCode':
              const customCode = node.data.code || '// Custom code';
              nodeCode += `${spaces}// Custom Code\n`;
              customCode.split('\n').forEach((line: string) => {
                nodeCode += `${spaces}${line}\n`;
              });
              nodeCode += '\n';
              break;
          }

          // Continue to next node (if not condition or loop)
          if (node.type !== 'condition' && node.type !== 'loop') {
            const nextEdge = edges.find((e) => e.source === nodeId);
            if (nextEdge) {
              nodeCode += generateNodeCode(nextEdge.target, depth);
            }
          }

          return nodeCode;
        }

        code += generateNodeCode(triggerNode.id, 1);

        code += `  return data;\n}\n`;

        return code;
      },
    })),
    { name: 'WorkflowStore' }
  )
);
