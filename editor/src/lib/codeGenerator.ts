import { Component } from '../types';

export class CodeGenerator {
  /**
   * Generate complete React component code from visual components
   */
  static generateReactComponent(
    components: Component[],
    componentName: string = 'GeneratedApp'
  ): string {
    const imports = this.generateImports(components);
    const componentBody = this.generateComponentBody(components);

    return `${imports}

export default function ${componentName}() {
  return (
${componentBody}
  );
}
`;
  }

  /**
   * Generate necessary imports based on used components
   */
  private static generateImports(components: Component[]): string {
    const imports = new Set<string>();
    imports.add("import React from 'react';");

    // Check if any components need special imports
    const hasForm = components.some(c => c.type === 'Form');
    if (hasForm) {
      imports.add("import { useState } from 'react';");
    }

    return Array.from(imports).join('\n');
  }

  /**
   * Generate component body JSX
   */
  private static generateComponentBody(components: Component[], depth: number = 2): string {
    const indent = '  '.repeat(depth);
    const lines: string[] = [];

    for (const component of components) {
      const jsx = this.generateComponentJSX(component, depth);
      lines.push(jsx);
    }

    return lines.join('\n');
  }

  /**
   * Generate JSX for a single component
   */
  private static generateComponentJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { type, props } = component;

    switch (type) {
      case 'Container':
      case 'Box':
      case 'Flex':
      case 'Grid':
      case 'Stack':
        return this.generateContainerJSX(component, depth);

      case 'Text':
      case 'Paragraph':
        return `${indent}<p className="${props.className || ''}">${props.content || 'Text'}</p>`;

      case 'Heading':
        const level = props.level || 1;
        return `${indent}<h${level} className="${props.className || ''}">${props.content || 'Heading'}</h${level}>`;

      case 'Link':
        return `${indent}<a href="${props.href || '#'}" className="${props.className || ''}">${props.content || 'Link'}</a>`;

      case 'Button':
        return `${indent}<button className="${props.className || ''}" type="${props.type || 'button'}">${props.content || 'Button'}</button>`;

      case 'Input':
        return `${indent}<input type="${props.type || 'text'}" placeholder="${props.placeholder || ''}" className="${props.className || ''}" />`;

      case 'TextArea':
        return `${indent}<textarea placeholder="${props.placeholder || ''}" rows={${props.rows || 4}} className="${props.className || ''}" />`;

      case 'Select':
        return this.generateSelectJSX(component, depth);

      case 'Checkbox':
        return this.generateCheckboxJSX(component, depth);

      case 'Radio':
        return this.generateRadioJSX(component, depth);

      case 'Switch':
        return this.generateSwitchJSX(component, depth);

      case 'Form':
        return this.generateFormJSX(component, depth);

      case 'Label':
        return `${indent}<label className="${props.className || ''}">${props.content || 'Label'}</label>`;

      case 'Table':
        return this.generateTableJSX(component, depth);

      case 'List':
        return this.generateListJSX(component, depth);

      case 'Card':
        return this.generateCardJSX(component, depth);

      case 'Badge':
        return `${indent}<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${props.className || ''}">${props.content || 'Badge'}</span>`;

      case 'Image':
        return `${indent}<img src="${props.src || 'https://via.placeholder.com/150'}" alt="${props.alt || 'Image'}" className="${props.className || ''}" />`;

      case 'Video':
        return this.generateVideoJSX(component, depth);

      case 'Icon':
        return `${indent}<span className="inline-block ${props.className || ''}">${props.name || '★'}</span>`;

      case 'Navbar':
        return this.generateNavbarJSX(component, depth);

      case 'Sidebar':
        return this.generateSidebarJSX(component, depth);

      case 'Breadcrumb':
        return this.generateBreadcrumbJSX(component, depth);

      case 'Tabs':
        return this.generateTabsJSX(component, depth);

      case 'Alert':
        return this.generateAlertJSX(component, depth);

      case 'Toast':
        return `${indent}<div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg ${props.className || ''}">${props.content || 'Toast notification'}</div>`;

      case 'Modal':
        return this.generateModalJSX(component, depth);

      case 'Spinner':
        return `${indent}<div className="inline-block animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${props.size || 'h-8 w-8'} ${props.className || ''}" />`;

      case 'Progress':
        return this.generateProgressJSX(component, depth);

      default:
        return `${indent}<div className="${props.className || ''}">Unknown component: {type}</div>`;
    }
  }

  private static generateContainerJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { type, props, children } = component;

    let className = props.className || '';
    if (type === 'Flex') className = `flex ${className}`;
    if (type === 'Grid') className = `grid ${className}`;
    if (type === 'Stack') {
      className = `flex ${props.direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className}`;
    }

    const hasChildren = children && children.length > 0;

    if (hasChildren) {
      const childrenJSX = children.map(child =>
        this.generateComponentJSX(child, depth + 1)
      ).join('\n');

      return `${indent}<div className="${className}">
${childrenJSX}
${indent}</div>`;
    }

    return `${indent}<div className="${className}" />`;
  }

  private static generateSelectJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;
    const options = props.options || [];

    const optionsJSX = options.map((opt: string) =>
      `${indent}  <option value="${opt}">${opt}</option>`
    ).join('\n');

    return `${indent}<select className="${props.className || ''}">
${optionsJSX}
${indent}</select>`;
  }

  private static generateCheckboxJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;

    return `${indent}<label className="flex items-center gap-2 ${props.className || ''}">
${indent}  <input type="checkbox" />
${indent}  <span>${props.label || 'Checkbox'}</span>
${indent}</label>`;
  }

  private static generateRadioJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;

    return `${indent}<label className="flex items-center gap-2 ${props.className || ''}">
${indent}  <input type="radio" name="${props.name || 'radio'}" />
${indent}  <span>${props.label || 'Radio'}</span>
${indent}</label>`;
  }

  private static generateSwitchJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;

    return `${indent}<label className="flex items-center gap-2 ${props.className || ''}">
${indent}  <input type="checkbox" className="sr-only peer" />
${indent}  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
${indent}  <span>${props.label || 'Switch'}</span>
${indent}</label>`;
  }

  private static generateFormJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props, children } = component;

    const hasChildren = children && children.length > 0;
    if (!hasChildren) {
      return `${indent}<form className="${props.className || ''}" />`;
    }

    const childrenJSX = children.map(child =>
      this.generateComponentJSX(child, depth + 1)
    ).join('\n');

    return `${indent}<form className="${props.className || ''}">
${childrenJSX}
${indent}</form>`;
  }

  private static generateTableJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;
    const columns = props.columns || [];
    const rows = props.rows || [];

    const headersJSX = columns.map((col: string) =>
      `${indent}      <th className="border px-4 py-2">${col}</th>`
    ).join('\n');

    const rowsJSX = rows.map((row: string[]) => {
      const cellsJSX = row.map(cell =>
        `${indent}        <td className="border px-4 py-2">${cell}</td>`
      ).join('\n');
      return `${indent}    <tr>
${cellsJSX}
${indent}    </tr>`;
    }).join('\n');

    return `${indent}<table className="${props.className || ''}">
${indent}  <thead>
${indent}    <tr>
${headersJSX}
${indent}    </tr>
${indent}  </thead>
${indent}  <tbody>
${rowsJSX}
${indent}  </tbody>
${indent}</table>`;
  }

  private static generateListJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;
    const items = props.items || [];

    const itemsJSX = items.map((item: string) =>
      `${indent}  <li>${item}</li>`
    ).join('\n');

    return `${indent}<ul className="${props.className || ''}">
${itemsJSX}
${indent}</ul>`;
  }

  private static generateCardJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props, children } = component;

    const hasChildren = children && children.length > 0;
    const childrenJSX = hasChildren
      ? '\n' + children.map(child => this.generateComponentJSX(child, depth + 2)).join('\n') + '\n' + indent + '  '
      : '';

    return `${indent}<div className="border rounded-lg shadow ${props.className || ''}">
${indent}  <div className="p-4">
${props.title ? `${indent}    <h3 className="text-lg font-semibold mb-2">${props.title}</h3>` : ''}
${props.content ? `${indent}    <p>${props.content}</p>` : ''}${childrenJSX}
${indent}  </div>
${indent}</div>`;
  }

  private static generateVideoJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;

    return `${indent}<video controls className="${props.className || ''}">
${indent}  <source src="${props.src || ''}" type="${props.type || 'video/mp4'}" />
${indent}  Your browser does not support the video tag.
${indent}</video>`;
  }

  private static generateNavbarJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;
    const links = props.links || [];

    const linksJSX = links.map((link: string) =>
      `${indent}    <a href="#" className="hover:underline">${link}</a>`
    ).join('\n');

    return `${indent}<nav className="flex items-center justify-between p-4 ${props.className || ''}">
${indent}  <div className="font-bold">${props.brand || 'Brand'}</div>
${indent}  <div className="flex gap-4">
${linksJSX}
${indent}  </div>
${indent}</nav>`;
  }

  private static generateSidebarJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;
    const items = props.items || [];

    const itemsJSX = items.map((item: string) =>
      `${indent}  <div className="py-2 px-4 hover:bg-gray-100 cursor-pointer">${item}</div>`
    ).join('\n');

    return `${indent}<aside className="w-64 p-4 border-r ${props.className || ''}">
${itemsJSX}
${indent}</aside>`;
  }

  private static generateBreadcrumbJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;
    const items = props.items || [];

    const itemsJSX = items.map((item: string, index: number) => {
      const isLast = index === items.length - 1;
      const separator = index > 0 ? `${indent}      <span className="mx-2">/</span>\n` : '';
      const className = isLast ? 'font-semibold' : 'text-blue-600 hover:underline';

      return `${separator}${indent}      <a href="#" className="${className}">${item}</a>`;
    }).join('\n');

    return `${indent}<nav className="${props.className || ''}">
${indent}  <ol className="flex items-center gap-2">
${indent}    <li className="flex items-center">
${itemsJSX}
${indent}    </li>
${indent}  </ol>
${indent}</nav>`;
  }

  private static generateTabsJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props, children } = component;
    const tabs = props.tabs || [];

    const tabsJSX = tabs.map((tab: string, index: number) =>
      `${indent}    <button className="px-4 py-2 ${index === 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}">${tab}</button>`
    ).join('\n');

    const hasChildren = children && children.length > 0;
    const childrenJSX = hasChildren
      ? '\n' + children.map(child => this.generateComponentJSX(child, depth + 2)).join('\n') + '\n' + indent + '  '
      : '';

    return `${indent}<div className="${props.className || ''}">
${indent}  <div className="flex border-b">
${tabsJSX}
${indent}  </div>
${indent}  <div className="p-4">${childrenJSX}</div>
${indent}</div>`;
  }

  private static generateAlertJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;

    const alertColors: Record<string, string> = {
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      success: 'bg-green-50 text-green-800 border-green-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      error: 'bg-red-50 text-red-800 border-red-200',
    };
    const colorClass = alertColors[props.variant || 'info'];

    return `${indent}<div className="border rounded p-4 ${colorClass} ${props.className || ''}">
${props.title ? `${indent}  <div className="font-semibold mb-1">${props.title}</div>` : ''}
${indent}  <div>${props.content || 'Alert message'}</div>
${indent}</div>`;
  }

  private static generateModalJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props, children } = component;

    const hasChildren = children && children.length > 0;
    const childrenJSX = hasChildren
      ? '\n' + children.map(child => this.generateComponentJSX(child, depth + 3)).join('\n') + '\n' + indent + '    '
      : '';

    return `${indent}<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
${indent}  <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full ${props.className || ''}">
${props.title ? `${indent}    <h2 className="text-xl font-semibold mb-4">${props.title}</h2>` : ''}
${indent}    <div>${props.content || 'Modal content'}${childrenJSX}</div>
${indent}  </div>
${indent}</div>`;
  }

  private static generateProgressJSX(component: Component, depth: number): string {
    const indent = '  '.repeat(depth);
    const { props } = component;

    return `${indent}<div className="w-full bg-gray-200 rounded-full h-2 ${props.className || ''}">
${indent}  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '${props.value || 0}%' }} />
${indent}</div>`;
  }

  /**
   * Generate complete Next.js project files
   */
  static generateProjectFiles(components: Component[], projectName: string = 'my-app'): Record<string, string> {
    const files: Record<string, string> = {};

    // Main page component
    files['pages/index.tsx'] = this.generateReactComponent(components, 'Home');

    // Package.json
    files['package.json'] = JSON.stringify({
      name: projectName,
      version: '1.0.0',
      private: true,
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
        autoprefixer: '^10',
        postcss: '^8',
      },
    }, null, 2);

    // Next.js config
    files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;

    // TypeScript config
    files['tsconfig.json'] = JSON.stringify({
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
    }, null, 2);

    // Tailwind config
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

    // PostCSS config
    files['postcss.config.js'] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

    // Global styles
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

    // App wrapper
    files['pages/_app.tsx'] = `import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
`;

    // README
    files['README.md'] = `# ${projectName}

This project was generated by ZeroCode - a no-code web application builder.

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
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

# typescript
*.tsbuildinfo
next-env.d.ts
`;

    return files;
  }
}
