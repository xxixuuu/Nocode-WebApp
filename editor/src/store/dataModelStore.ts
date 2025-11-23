import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Node, Edge } from 'reactflow';

interface DataModelStore {
  nodes: Node[];
  edges: Edge[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;

  generatePrismaSchema: () => string;
  generateAPIRoutes: () => Record<string, string>;
}

export const useDataModelStore = create<DataModelStore>()(
  devtools(
    immer((set, get) => ({
      nodes: [],
      edges: [],

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      addNode: (node) =>
        set((state) => {
          state.nodes.push(node);
        }),

      updateNode: (nodeId, data) =>
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            node.data = { ...node.data, ...data };
          }
        }),

      deleteNode: (nodeId) =>
        set((state) => {
          state.nodes = state.nodes.filter((n) => n.id !== nodeId);
          state.edges = state.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          );
        }),

      generatePrismaSchema: () => {
        const { nodes, edges } = get();
        let schema = `// Generated Prisma Schema\n\n`;

        schema += `generator client {\n`;
        schema += `  provider = "prisma-client-js"\n`;
        schema += `}\n\n`;

        schema += `datasource db {\n`;
        schema += `  provider = "postgresql"\n`;
        schema += `  url      = env("DATABASE_URL")\n`;
        schema += `}\n\n`;

        // Generate models
        for (const node of nodes) {
          if (node.type !== 'entity') continue;

          const { label, fields } = node.data;
          schema += `model ${label} {\n`;

          // Generate fields
          for (const field of fields || []) {
            const optional = field.isRequired ? '' : '?';
            const unique = field.isUnique ? ' @unique' : '';
            const id = field.isId ? ' @id @default(cuid())' : '';
            const defaultValue = field.defaultValue && !field.isId
              ? ` @default(${formatDefaultValue(field.type, field.defaultValue)})`
              : '';

            schema += `  ${field.name} ${field.type}${optional}${id}${unique}${defaultValue}\n`;
          }

          // Generate relations
          const relations = edges.filter((e) => e.source === node.id || e.target === node.id);
          for (const relation of relations) {
            const isSource = relation.source === node.id;
            const otherNodeId = isSource ? relation.target : relation.source;
            const otherNode = nodes.find((n) => n.id === otherNodeId);

            if (otherNode) {
              const relationName = otherNode.data.label.toLowerCase();
              if (isSource) {
                schema += `  ${relationName}   ${otherNode.data.label}? @relation(fields: [${relationName}Id], references: [id])\n`;
                schema += `  ${relationName}Id String?\n`;
              }
            }
          }

          schema += `\n  createdAt DateTime @default(now())\n`;
          schema += `  updatedAt DateTime @updatedAt\n`;
          schema += `}\n\n`;
        }

        return schema;
      },

      generateAPIRoutes: () => {
        const { nodes } = get();
        const routes: Record<string, string> = {};

        for (const node of nodes) {
          if (node.type !== 'entity') continue;

          const modelName = node.data.label;
          const modelNameLower = modelName.toLowerCase();
          const routePath = `app/api/${modelNameLower}/route.ts`;

          routes[routePath] = generateAPIRouteCode(modelName, modelNameLower);
        }

        return routes;
      },
    })),
    { name: 'DataModelStore' }
  )
);

function formatDefaultValue(type: string, value: string): string {
  if (type === 'String') {
    return `"${value}"`;
  } else if (type === 'Boolean') {
    return value;
  } else if (type === 'Int' || type === 'Float') {
    return value;
  } else if (type === 'DateTime') {
    return value === 'now' ? 'now()' : `"${value}"`;
  }
  return value;
}

function generateAPIRouteCode(modelName: string, modelNameLower: string): string {
  return `import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/${modelNameLower}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const item = await prisma.${modelNameLower}.findUnique({
        where: { id },
      })
      return NextResponse.json(item)
    }

    const items = await prisma.${modelNameLower}.findMany()
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ${modelNameLower}' }, { status: 500 })
  }
}

// POST /api/${modelNameLower}
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const item = await prisma.${modelNameLower}.create({
      data: body,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ${modelNameLower}' }, { status: 500 })
  }
}

// PATCH /api/${modelNameLower}
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const item = await prisma.${modelNameLower}.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ${modelNameLower}' }, { status: 500 })
  }
}

// DELETE /api/${modelNameLower}
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.${modelNameLower}.delete({
      where: { id },
    })
    return NextResponse.json({ message: '${modelName} deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ${modelNameLower}' }, { status: 500 })
  }
}
`;
}
