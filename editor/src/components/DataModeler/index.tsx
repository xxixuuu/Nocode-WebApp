import { useCallback, useState } from 'react';
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
import { EntityNode } from './EntityNode';
import { EntityPanel } from './EntityPanel';
import { Plus } from 'lucide-react';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
};

export function DataModeler() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showEntityPanel, setShowEntityPanel] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        label: '1:N',
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addEntity = () => {
    const newNode: Node = {
      id: `entity-${Date.now()}`,
      type: 'entity',
      position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 },
      data: {
        label: `Entity${nodes.length + 1}`,
        fields: [
          {
            id: 'id',
            name: 'id',
            type: 'String',
            isId: true,
            isRequired: true,
            isUnique: true,
          },
        ],
        onEdit: (nodeId: string) => {
          const node = nodes.find((n) => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            setShowEntityPanel(true);
          }
        },
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const updateEntity = (nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  };

  const deleteEntity = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setShowEntityPanel(false);
    }
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setShowEntityPanel(true);
  }, []);

  return (
    <div className="h-full flex">
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

        {/* Add Entity Button */}
        <button
          onClick={addEntity}
          className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 flex items-center gap-2 z-10"
        >
          <Plus className="w-4 h-4" />
          Add Entity
        </button>

        {/* Schema Actions */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="px-4 py-2 bg-card border border-border rounded-lg shadow hover:bg-accent">
            Generate Prisma Schema
          </button>
          <button className="px-4 py-2 bg-card border border-border rounded-lg shadow hover:bg-accent">
            Generate API Routes
          </button>
        </div>
      </div>

      {/* Entity Edit Panel */}
      {showEntityPanel && selectedNode && (
        <EntityPanel
          node={selectedNode}
          onUpdate={(data) => updateEntity(selectedNode.id, data)}
          onDelete={() => deleteEntity(selectedNode.id)}
          onClose={() => setShowEntityPanel(false)}
        />
      )}
    </div>
  );
}
