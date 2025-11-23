import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerNode } from './nodes/TriggerNode';
import { ConditionNode } from './nodes/ConditionNode';
import { APICallNode } from './nodes/APICallNode';
import { LoopNode } from './nodes/LoopNode';
import { CustomCodeNode } from './nodes/CustomCodeNode';
import { WorkflowToolbar } from './WorkflowToolbar';
import { WorkflowCodePreview } from './WorkflowCodePreview';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  apiCall: APICallNode,
  loop: LoopNode,
  customCode: CustomCodeNode,
};

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);

  const { setNodes: setStoreNodes, setEdges: setStoreEdges } = useWorkflowStore();

  // Sync nodes and edges to workflowStore
  useEffect(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addNode = (type: string) => {
    const nodeDefaults: Record<string, any> = {
      trigger: {
        label: 'Trigger',
        event: 'onClick',
      },
      condition: {
        label: 'Condition',
        expression: 'value > 0',
      },
      apiCall: {
        label: 'API Call',
        method: 'GET',
        url: '/api/endpoint',
      },
      loop: {
        label: 'Loop',
        array: 'items',
      },
      customCode: {
        label: 'Custom Code',
        code: '// Write your custom code here\nreturn data;',
      },
    };

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250 + nodes.length * 50, y: 100 + nodes.length * 50 },
      data: nodeDefaults[type] || {},
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const updateNode = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const generateCode = () => {
    setShowCodePreview(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <WorkflowToolbar onAddNode={addNode} onGenerateCode={generateCode} />

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Code Preview Modal */}
      {showCodePreview && (
        <WorkflowCodePreview onClose={() => setShowCodePreview(false)} />
      )}
    </div>
  );
}
