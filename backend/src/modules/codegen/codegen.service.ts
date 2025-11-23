import { Injectable, Logger } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import * as ts from 'typescript';
import Handlebars from 'handlebars';
import * as prettier from 'prettier';

export interface GeneratedProject {
  files: Array<{
    path: string;
    content: string;
  }>;
  metadata: {
    framework: string;
    componentsCount: number;
    linesOfCode: number;
  };
}

@Injectable()
export class CodegenService {
  private readonly logger = new Logger(CodegenService.name);

  constructor(private projectsService: ProjectsService) {}

  /**
   * Generate full project code
   */
  async generateProject(projectId: string, userId: string): Promise<GeneratedProject> {
    this.logger.log(`Generating code for project ${projectId}`);

    const project = await this.projectsService.findOne(projectId, userId);

    const framework = project.framework.toLowerCase();

    switch (framework) {
      case 'nextjs':
        return this.generateNextJsProject(project);
      case 'vite_react':
        return this.generateViteReactProject(project);
      case 'svelte':
        return this.generateSvelteProject(project);
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  /**
   * Generate Next.js App Router project
   */
  private async generateNextJsProject(project: any): Promise<GeneratedProject> {
    const files: Array<{ path: string; content: string }> = [];

    // package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(project),
    });

    // tsconfig.json
    files.push({
      path: 'tsconfig.json',
      content: this.generateTsConfig(),
    });

    // next.config.js
    files.push({
      path: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {}\n\nmodule.exports = nextConfig`,
    });

    // tailwind.config.js
    files.push({
      path: 'tailwind.config.js',
      content: this.generateTailwindConfig(),
    });

    // app/layout.tsx
    files.push({
      path: 'app/layout.tsx',
      content: this.generateRootLayout(project),
    });

    // app/page.tsx - Main page with components
    const rootComponents = project.components.filter((c: any) => !c.parentId);
    files.push({
      path: 'app/page.tsx',
      content: this.generatePageComponent(rootComponents, project.components),
    });

    // Generate API routes from schemas
    if (project.schemas && project.schemas.length > 0) {
      for (const schema of project.schemas) {
        files.push({
          path: `app/api/${schema.name.toLowerCase()}/route.ts`,
          content: this.generateAPIRoute(schema),
        });
      }
    }

    // lib/prisma.ts (if schemas exist)
    if (project.schemas && project.schemas.length > 0) {
      files.push({
        path: 'lib/prisma.ts',
        content: this.generatePrismaClient(),
      });

      // prisma/schema.prisma
      files.push({
        path: 'prisma/schema.prisma',
        content: this.generatePrismaSchema(project.schemas),
      });
    }

    // Format all TypeScript files
    for (const file of files) {
      if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
        file.content = await this.formatCode(file.content);
      }
    }

    return {
      files,
      metadata: {
        framework: 'nextjs',
        componentsCount: project.components.length,
        linesOfCode: files.reduce((acc, f) => acc + f.content.split('\n').length, 0),
      },
    };
  }

  /**
   * Generate Vite + React project
   */
  private async generateViteReactProject(project: any): Promise<GeneratedProject> {
    // Similar to Next.js but with Vite structure
    const files: Array<{ path: string; content: string }> = [];

    files.push({
      path: 'package.json',
      content: this.generatePackageJson(project, 'vite'),
    });

    files.push({
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    });

    files.push({
      path: 'src/main.tsx',
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    });

    const rootComponents = project.components.filter((c: any) => !c.parentId);
    files.push({
      path: 'src/App.tsx',
      content: this.generatePageComponent(rootComponents, project.components),
    });

    return {
      files,
      metadata: {
        framework: 'vite-react',
        componentsCount: project.components.length,
        linesOfCode: files.reduce((acc, f) => acc + f.content.split('\n').length, 0),
      },
    };
  }

  /**
   * Generate Svelte project (placeholder)
   */
  private async generateSvelteProject(project: any): Promise<GeneratedProject> {
    throw new Error('Svelte generation not implemented yet');
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(project: any, framework: string = 'nextjs'): string {
    const deps = framework === 'nextjs'
      ? {
          next: '^14.0.4',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        }
      : {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        };

    const devDeps = framework === 'nextjs'
      ? {
          typescript: '^5.3.3',
          '@types/node': '^20.10.6',
          '@types/react': '^18.2.45',
          '@types/react-dom': '^18.2.18',
          tailwindcss: '^3.4.0',
          autoprefixer: '^10.4.16',
          postcss: '^8.4.32',
        }
      : {
          '@vitejs/plugin-react': '^4.2.1',
          vite: '^5.0.8',
          typescript: '^5.3.3',
          '@types/react': '^18.2.45',
          '@types/react-dom': '^18.2.18',
          tailwindcss: '^3.4.0',
        };

    return JSON.stringify(
      {
        name: project.name.toLowerCase().replace(/\s+/g, '-'),
        version: '0.1.0',
        private: true,
        scripts:
          framework === 'nextjs'
            ? {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                lint: 'next lint',
              }
            : {
                dev: 'vite',
                build: 'vite build',
                preview: 'vite preview',
              },
        dependencies: deps,
        devDependencies: devDeps,
      },
      null,
      2,
    );
  }

  /**
   * Generate tsconfig.json
   */
  private generateTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          jsx: 'preserve',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          isolatedModules: true,
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: {
            '@/*': ['./*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2,
    );
  }

  /**
   * Generate Tailwind config
   */
  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
  }

  /**
   * Generate root layout
   */
  private generateRootLayout(project: any): string {
    return `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${project.name}',
  description: '${project.description || 'Generated by ZeroCode'}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;
  }

  /**
   * Generate page component from components tree
   */
  private generatePageComponent(rootComponents: any[], allComponents: any[]): string {
    const jsx = rootComponents.map((comp) => this.generateComponentJSX(comp, allComponents, 2)).join('\n');

    return `export default function Page() {
  return (
    <>
${jsx}
    </>
  )
}`;
  }

  /**
   * Generate JSX for a component recursively
   */
  private generateComponentJSX(component: any, allComponents: any[], indent: number): string {
    const spaces = ' '.repeat(indent);
    const { type, props } = component;
    const className = props.className ? ` className="${props.className}"` : '';

    const children = component.children
      .map((childId: string) => allComponents.find((c: any) => c.id === childId))
      .filter(Boolean);

    const hasChildren = children.length > 0;

    switch (type) {
      case 'Container':
      case 'Box':
        if (hasChildren) {
          const childrenJSX = children.map((child: any) => this.generateComponentJSX(child, allComponents, indent + 2)).join('\n');
          return `${spaces}<div${className}>\n${childrenJSX}\n${spaces}</div>`;
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

  /**
   * Generate API route for schema
   */
  private generateAPIRoute(schema: any): string {
    const modelName = schema.name;
    const modelNameLower = modelName.toLowerCase();

    return `import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.${modelNameLower}.findMany()
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await prisma.${modelNameLower}.create({
    data: body,
  })
  return NextResponse.json(item)
}`;
  }

  /**
   * Generate Prisma client
   */
  private generatePrismaClient(): string {
    return `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma`;
  }

  /**
   * Generate Prisma schema from schemas
   */
  private generatePrismaSchema(schemas: any[]): string {
    let schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    for (const schema of schemas) {
      schemaContent += `model ${schema.name} {\n`;

      for (const field of schema.fields) {
        const optional = field.isRequired ? '' : '?';
        const unique = field.isUnique ? ' @unique' : '';
        const id = field.isId ? ' @id @default(cuid())' : '';
        const defaultValue = field.defaultValue ? ` @default(${field.defaultValue})` : '';

        schemaContent += `  ${field.name} ${field.type}${optional}${id}${unique}${defaultValue}\n`;
      }

      schemaContent += `}\n\n`;
    }

    return schemaContent;
  }

  /**
   * Format code with Prettier
   */
  private async formatCode(code: string): Promise<string> {
    try {
      return await prettier.format(code, {
        parser: 'typescript',
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
      });
    } catch {
      return code;
    }
  }
}
