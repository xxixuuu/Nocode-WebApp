import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface DeploymentConfig {
  platform: 'vercel' | 'railway';
  projectName: string;
  environmentVariables?: Record<string, string>;
  buildCommand?: string;
  outputDirectory?: string;
  framework?: string;
}

export interface DeploymentResult {
  id: string;
  url: string;
  status: 'pending' | 'building' | 'ready' | 'error';
  platform: string;
  createdAt: Date;
}

@Injectable()
export class DeploymentService {
  constructor(private configService: ConfigService) {}

  /**
   * Deploy to Vercel
   */
  async deployToVercel(
    config: DeploymentConfig,
    files: Record<string, string>,
  ): Promise<DeploymentResult> {
    const vercelToken = this.configService.get<string>('VERCEL_TOKEN');

    if (!vercelToken) {
      throw new HttpException(
        'Vercel token not configured',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Create deployment using Vercel API
      const response = await axios.post(
        'https://api.vercel.com/v13/deployments',
        {
          name: config.projectName,
          files: Object.entries(files).map(([path, content]) => ({
            file: path,
            data: content,
          })),
          projectSettings: {
            framework: config.framework || 'nextjs',
            buildCommand: config.buildCommand || 'npm run build',
            outputDirectory: config.outputDirectory || '.next',
          },
          target: 'production',
          env: config.environmentVariables || {},
        },
        {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const deployment = response.data;

      return {
        id: deployment.id,
        url: `https://${deployment.url}`,
        status: deployment.readyState === 'READY' ? 'ready' : 'building',
        platform: 'vercel',
        createdAt: new Date(deployment.createdAt),
      };
    } catch (error) {
      throw new HttpException(
        `Vercel deployment failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deploy to Railway
   */
  async deployToRailway(
    config: DeploymentConfig,
    repositoryUrl: string,
  ): Promise<DeploymentResult> {
    const railwayToken = this.configService.get<string>('RAILWAY_TOKEN');

    if (!railwayToken) {
      throw new HttpException(
        'Railway token not configured',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Create project and deployment using Railway GraphQL API
      const createProjectMutation = `
        mutation CreateProject($name: String!) {
          projectCreate(input: { name: $name }) {
            id
            name
          }
        }
      `;

      const projectResponse = await axios.post(
        'https://backboard.railway.app/graphql/v2',
        {
          query: createProjectMutation,
          variables: { name: config.projectName },
        },
        {
          headers: {
            Authorization: `Bearer ${railwayToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const projectId = projectResponse.data.data.projectCreate.id;

      // Deploy from repository
      const deployMutation = `
        mutation DeployFromRepo($projectId: String!, $repo: String!, $branch: String!) {
          deploymentCreate(
            input: {
              projectId: $projectId
              environmentId: "production"
              repo: $repo
              branch: $branch
            }
          ) {
            id
            status
            url
          }
        }
      `;

      const deployResponse = await axios.post(
        'https://backboard.railway.app/graphql/v2',
        {
          query: deployMutation,
          variables: {
            projectId,
            repo: repositoryUrl,
            branch: 'main',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${railwayToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const deployment = deployResponse.data.data.deploymentCreate;

      return {
        id: deployment.id,
        url: deployment.url || `https://${config.projectName}.up.railway.app`,
        status: deployment.status === 'SUCCESS' ? 'ready' : 'building',
        platform: 'railway',
        createdAt: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        `Railway deployment failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(
    platform: 'vercel' | 'railway',
    deploymentId: string,
  ): Promise<DeploymentResult> {
    if (platform === 'vercel') {
      return this.getVercelDeploymentStatus(deploymentId);
    } else {
      return this.getRailwayDeploymentStatus(deploymentId);
    }
  }

  private async getVercelDeploymentStatus(
    deploymentId: string,
  ): Promise<DeploymentResult> {
    const vercelToken = this.configService.get<string>('VERCEL_TOKEN');

    try {
      const response = await axios.get(
        `https://api.vercel.com/v13/deployments/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        },
      );

      const deployment = response.data;

      return {
        id: deployment.id,
        url: `https://${deployment.url}`,
        status: this.mapVercelStatus(deployment.readyState),
        platform: 'vercel',
        createdAt: new Date(deployment.createdAt),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get Vercel deployment status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getRailwayDeploymentStatus(
    deploymentId: string,
  ): Promise<DeploymentResult> {
    const railwayToken = this.configService.get<string>('RAILWAY_TOKEN');

    try {
      const query = `
        query GetDeployment($id: String!) {
          deployment(id: $id) {
            id
            status
            url
            createdAt
          }
        }
      `;

      const response = await axios.post(
        'https://backboard.railway.app/graphql/v2',
        {
          query,
          variables: { id: deploymentId },
        },
        {
          headers: {
            Authorization: `Bearer ${railwayToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const deployment = response.data.data.deployment;

      return {
        id: deployment.id,
        url: deployment.url,
        status: this.mapRailwayStatus(deployment.status),
        platform: 'railway',
        createdAt: new Date(deployment.createdAt),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to get Railway deployment status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapVercelStatus(
    vercelStatus: string,
  ): 'pending' | 'building' | 'ready' | 'error' {
    switch (vercelStatus) {
      case 'READY':
        return 'ready';
      case 'ERROR':
        return 'error';
      case 'BUILDING':
        return 'building';
      default:
        return 'pending';
    }
  }

  private mapRailwayStatus(
    railwayStatus: string,
  ): 'pending' | 'building' | 'ready' | 'error' {
    switch (railwayStatus) {
      case 'SUCCESS':
        return 'ready';
      case 'FAILED':
        return 'error';
      case 'BUILDING':
        return 'building';
      default:
        return 'pending';
    }
  }

  /**
   * Generate deployment files from project data
   */
  generateDeploymentFiles(projectData: any): Record<string, string> {
    const files: Record<string, string> = {};

    // package.json
    files['package.json'] = JSON.stringify(
      {
        name: projectData.name || 'generated-app',
        version: '1.0.0',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          '@types/node': '^20',
          '@types/react': '^18',
          '@types/react-dom': '^18',
          typescript: '^5',
          tailwindcss: '^3.4.0',
        },
      },
      null,
      2,
    );

    // next.config.js
    files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;

    // tsconfig.json
    files['tsconfig.json'] = JSON.stringify(
      {
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          paths: {
            '@/*': ['./*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
        exclude: ['node_modules'],
      },
      null,
      2,
    );

    // tailwind.config.js
    files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
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
}
`;

    // pages/_app.tsx
    files['pages/_app.tsx'] = `import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
`;

    // pages/index.tsx - Generated from components
    files['pages/index.tsx'] = this.generateIndexPage(projectData);

    // styles/globals.css
    files['styles/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
`;

    // .gitignore
    files['.gitignore'] = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel
`;

    return files;
  }

  private generateIndexPage(projectData: any): string {
    // This would generate the actual page from the visual editor components
    // For now, returning a placeholder
    return `export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to ${projectData.name || 'Your App'}</h1>
      <p className="text-gray-600">This app was generated by ZeroCode.</p>
    </div>
  )
}
`;
  }
}
