# ZeroCode - システムアーキテクチャ設計書

## 目次
1. [システム概要](#システム概要)
2. [全体アーキテクチャ](#全体アーキテクチャ)
3. [コンポーネント詳細設計](#コンポーネント詳細設計)
4. [データフロー](#データフロー)
5. [コード生成戦略](#コード生成戦略)
6. [セキュリティ設計](#セキュリティ設計)
7. [サンドボックス実装方針](#サンドボックス実装方針)
8. [実装ロードマップ](#実装ロードマップ)

---

## システム概要

### ビジョン
ZeroCodeは、ドラッグ&ドロップでフルスタックWebアプリケーションを構築できる次世代ノーコードプラットフォームです。ローカルLLM（Ollama）を活用し、真の「AIペアプログラミング」体験を提供します。

### コア機能
- **ビジュアルエディター**: React DnDベースのUIビルダー
- **データモデリング**: ER図からAPI自動生成
- **ビジネスロジック**: ノードベースワークフローエディター
- **AI統合**: Ollamaによるコード生成・レビュー・最適化
- **コード生成**: クリーンで本番対応のコード出力
- **サンドボックス**: 安全なコード実行環境
- **デプロイメント**: ワンクリックデプロイ

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           React Editor (Port 3000)                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │ DnD      │ │ Data     │ │ Workflow │ │ Code     │ │    │
│  │  │ Canvas   │ │ Modeler  │ │ Builder  │ │ Preview  │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  │                                                          │    │
│  │  State Management: Zustand + React Query                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ (WebSocket + HTTP/GraphQL)
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           NestJS API Server (Port 4000)                 │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │ Projects │ │ CodeGen  │ │ Deploy   │ │ Ollama   │ │    │
│  │  │ Module   │ │ Engine   │ │ Service  │ │ AI       │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  │                                                          │    │
│  │  GraphQL API + REST API + WebSocket Gateway             │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CodeGen    │  │   Ollama     │  │   Sandbox    │         │
│  │   Engine     │  │   Service    │  │   Manager    │         │
│  │              │  │              │  │              │         │
│  │ - AST        │  │ - Code Gen   │  │ - Docker     │         │
│  │ - Templates  │  │ - Review     │  │ - Resource   │         │
│  │ - Validation │  │ - Debug      │  │   Limits     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PostgreSQL  │  │    Redis     │  │   MongoDB    │         │
│  │              │  │              │  │              │         │
│  │ - Projects   │  │ - Sessions   │  │ - Generated  │         │
│  │ - Users      │  │ - Cache      │  │   Code       │         │
│  │ - Schemas    │  │ - Job Queue  │  │ - Templates  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Execution Layer                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Docker Sandbox (Isolated)                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │ User App │ │ User App │ │ User App │ │ User App │ │    │
│  │  │ #1       │ │ #2       │ │ #3       │ │ #N       │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  │                                                          │    │
│  │  CPU: 1 core | RAM: 512MB | Network: Isolated          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## コンポーネント詳細設計

### 1. エディター (React Frontend)

#### 1.1 DnD Canvas
```typescript
// コンポーネント階層構造
DnDCanvas/
├── Canvas.tsx              // メインキャンバス
├── ComponentPalette.tsx    // ドラッグ可能なコンポーネント一覧
├── DroppableArea.tsx       // ドロップゾーン
├── ComponentRenderer.tsx   // コンポーネントレンダラー
└── SelectionBox.tsx        // 選択・リサイズUI

// 使用技術
- react-dnd: ドラッグ&ドロップ
- @dnd-kit/core: 代替案（より軽量）
- framer-motion: アニメーション
```

**状態管理（Zustand）**:
```typescript
interface EditorStore {
  components: Component[];
  selectedId: string | null;
  addComponent: (component: Component) => void;
  updateComponent: (id: string, props: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  undo: () => void;
  redo: () => void;
  history: EditorState[];
}
```

#### 1.2 プロパティパネル
```typescript
PropertyPanel/
├── DynamicForm.tsx         // 動的フォーム生成
├── StyleEditor.tsx         // CSS編集
├── EventHandlers.tsx       // イベント設定
└── DataBinding.tsx         // データバインディング

// JSONスキーマベースのフォーム生成
{
  "type": "object",
  "properties": {
    "backgroundColor": { "type": "string", "format": "color" },
    "padding": { "type": "number", "min": 0, "max": 100 }
  }
}
```

#### 1.3 データモデラー
```typescript
DataModeler/
├── ERDiagram.tsx           // React Flowベース
├── SchemaEditor.tsx        // スキーマ定義UI
├── RelationshipEditor.tsx  // リレーション設定
└── MigrationPreview.tsx    // マイグレーションプレビュー

// データフロー
User Input → Schema Definition → Prisma Schema → Migration SQL
```

#### 1.4 ワークフローエディター
```typescript
WorkflowBuilder/
├── FlowCanvas.tsx          // React Flow統合
├── NodeTypes/
│   ├── APICallNode.tsx
│   ├── ConditionNode.tsx
│   ├── LoopNode.tsx
│   └── CustomCodeNode.tsx
└── EdgeTypes/
    └── ConditionalEdge.tsx

// ノードの実行ロジック
Node → Validation → Code Generation → Runtime Execution
```

---

### 2. バックエンド (NestJS)

#### 2.1 プロジェクトモジュール
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Component, Schema]),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsResolver],
})
export class ProjectsModule {}

// GraphQL Schema
type Project {
  id: ID!
  name: String!
  components: [Component!]!
  schemas: [Schema!]!
  workflows: [Workflow!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### 2.2 コード生成エンジン
```typescript
CodeGenEngine/
├── generators/
│   ├── NextJsGenerator.ts      // Next.js App Router
│   ├── ViteReactGenerator.ts   // Vite + React
│   ├── SvelteGenerator.ts      // SvelteKit
│   └── APIGenerator.ts         // REST/GraphQL API
├── templates/
│   ├── nextjs/
│   │   ├── app/
│   │   ├── components/
│   │   └── api/
│   └── shared/
└── validators/
    ├── TypeScriptValidator.ts
    └── ESLintRunner.ts

// コード生成フロー
Component Tree → AST Generation → Template Rendering →
  → Validation → Formatting (Prettier) → Output
```

**AST操作例**:
```typescript
import * as ts from 'typescript';

class ComponentGenerator {
  generateComponent(component: ComponentDefinition): string {
    // TypeScript AST生成
    const sourceFile = ts.createSourceFile(
      'Component.tsx',
      '',
      ts.ScriptTarget.Latest
    );

    const componentNode = ts.factory.createFunctionDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      undefined,
      component.name,
      undefined,
      [/* props */],
      undefined,
      /* body */
    );

    // AST → コード
    const printer = ts.createPrinter();
    return printer.printNode(ts.EmitHint.Unspecified, componentNode, sourceFile);
  }
}
```

#### 2.3 Ollama統合モジュール
```typescript
@Injectable()
export class OllamaService {
  constructor(
    private httpService: HttpService,
    @InjectQueue('ai-tasks') private aiQueue: Queue,
  ) {}

  async generateComponent(prompt: string): Promise<string> {
    // Ollamaにリクエスト
    const response = await this.httpService.post('http://localhost:11434/api/generate', {
      model: 'deepseek-coder:6.7b',
      prompt: `Generate a React component for: ${prompt}`,
      stream: false,
    }).toPromise();

    return this.validateAndFormat(response.data.response);
  }

  async reviewCode(code: string): Promise<CodeReview> {
    const response = await this.httpService.post('http://localhost:11434/api/generate', {
      model: 'codellama:13b',
      prompt: `Review this code and suggest improvements:\n\n${code}`,
    }).toPromise();

    return this.parseReview(response.data.response);
  }

  async debugCode(code: string, error: string): Promise<string> {
    const response = await this.httpService.post('http://localhost:11434/api/generate', {
      model: 'starcoder2:15b',
      prompt: `Fix this error:\n\nCode:\n${code}\n\nError:\n${error}`,
    }).toPromise();

    return response.data.response;
  }
}
```

**ジョブキュー（Bull MQ）**:
```typescript
@Processor('ai-tasks')
export class AITasksProcessor {
  @Process('generate-component')
  async handleGeneration(job: Job<GenerationTask>) {
    const { prompt, userId } = job.data;

    // 進捗更新
    await job.progress(10);

    const code = await this.ollamaService.generateComponent(prompt);
    await job.progress(50);

    const validated = await this.validateCode(code);
    await job.progress(80);

    return validated;
  }
}
```

---

### 3. コード生成エンジン

#### 3.1 テンプレートシステム
```
templates/
├── nextjs/
│   ├── base/
│   │   ├── package.json.hbs
│   │   ├── tsconfig.json.hbs
│   │   ├── next.config.js.hbs
│   │   └── .env.example.hbs
│   ├── app/
│   │   ├── layout.tsx.hbs
│   │   ├── page.tsx.hbs
│   │   └── api/
│   ├── components/
│   │   └── {{componentName}}.tsx.hbs
│   └── lib/
│       ├── prisma.ts.hbs
│       └── auth.ts.hbs
└── shared/
    ├── eslintrc.json.hbs
    └── prettierrc.json.hbs
```

**Handlebarsテンプレート例**:
```handlebars
// components/{{componentName}}.tsx.hbs
import React from 'react';
{{#if hasState}}
import { useState } from 'react';
{{/if}}

interface {{componentName}}Props {
  {{#each props}}
  {{name}}: {{type}};
  {{/each}}
}

export default function {{componentName}}({ {{#each props}}{{name}}, {{/each}} }: {{componentName}}Props) {
  {{#if hasState}}
  {{#each states}}
  const [{{name}}, set{{capitalize name}}] = useState<{{type}}>({{defaultValue}});
  {{/each}}
  {{/if}}

  return (
    <div className="{{className}}">
      {{{children}}}
    </div>
  );
}
```

#### 3.2 コード生成パイプライン
```typescript
class CodeGenerationPipeline {
  async generate(project: Project): Promise<GeneratedProject> {
    // 1. コンポーネントツリーの解析
    const componentTree = this.parseComponentTree(project.components);

    // 2. データスキーマの解析
    const prismaSchema = this.generatePrismaSchema(project.schemas);

    // 3. APIルートの生成
    const apiRoutes = this.generateAPIRoutes(project.schemas, project.workflows);

    // 4. テンプレートのレンダリング
    const files = await this.renderTemplates({
      componentTree,
      prismaSchema,
      apiRoutes,
    });

    // 5. コード検証
    await this.validateCode(files);

    // 6. フォーマット
    const formatted = await this.formatCode(files);

    // 7. バンドル（オプション）
    const bundled = await this.bundleCode(formatted);

    return bundled;
  }
}
```

---

## データフロー

### リアルタイム協業編集フロー
```
User A Input → WebSocket → Server → CRDT Merge → Broadcast → User B Update
                                         ↓
                                    PostgreSQL
                                    (Persistent)
```

**CRDT実装（Yjs）**:
```typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const ycomponents = ydoc.getArray('components');

// WebSocketプロバイダー
const provider = new WebsocketProvider(
  'ws://localhost:4000',
  'project-123',
  ydoc
);

// 変更の監視
ycomponents.observe((event) => {
  // UI更新
  updateCanvas(ycomponents.toJSON());
});
```

### コード生成フロー
```
Editor State → Serialize → CodeGen Engine → AST Transform →
  → Template Render → Validate → Format → Save to MongoDB
```

---

## コード生成戦略

### 1. コンポーネントベース生成

**入力**: エディターのコンポーネントツリー
```json
{
  "type": "Container",
  "props": { "className": "flex flex-col gap-4" },
  "children": [
    {
      "type": "Button",
      "props": {
        "variant": "primary",
        "onClick": "handleSubmit"
      },
      "children": ["Submit"]
    }
  ]
}
```

**出力**: React コンポーネント
```tsx
export default function GeneratedPage() {
  const handleSubmit = () => {
    // Generated by workflow
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        className="btn-primary"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
```

### 2. データスキーマ → API生成

**入力**: ER図定義
```json
{
  "models": [
    {
      "name": "User",
      "fields": [
        { "name": "id", "type": "String", "isId": true },
        { "name": "email", "type": "String", "isUnique": true },
        { "name": "posts", "type": "Post[]", "relation": true }
      ]
    }
  ]
}
```

**出力**: Prisma Schema
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}
```

**出力**: REST API
```typescript
// app/api/users/route.ts
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const users = await prisma.user.findMany({
    include: { posts: true },
  });
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: body,
  });
  return Response.json(user);
}
```

### 3. ワークフロー → ビジネスロジック生成

**入力**: ビジュアルワークフロー
```json
{
  "nodes": [
    { "id": "1", "type": "trigger", "data": { "event": "onSubmit" } },
    { "id": "2", "type": "condition", "data": { "condition": "email !== ''" } },
    { "id": "3", "type": "apiCall", "data": { "endpoint": "/api/users", "method": "POST" } }
  ],
  "edges": [
    { "source": "1", "target": "2" },
    { "source": "2", "target": "3", "condition": "true" }
  ]
}
```

**出力**: TypeScript関数
```typescript
async function handleSubmit(formData: FormData) {
  const email = formData.get('email');

  // Node 2: Condition
  if (email !== '') {
    // Node 3: API Call
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response.json();
  }
}
```

---

## セキュリティ設計

### 1. コード検証パイプライン

```typescript
class SecurityValidator {
  private blacklist = [
    'eval', 'Function', '__proto__', 'constructor',
    'process.exit', 'child_process', 'fs.unlink'
  ];

  async validateCode(code: string): Promise<ValidationResult> {
    // 1. 構文チェック
    const syntaxErrors = await this.checkSyntax(code);
    if (syntaxErrors.length > 0) {
      return { valid: false, errors: syntaxErrors };
    }

    // 2. 危険な関数のチェック
    const dangerousPatterns = this.checkDangerousPatterns(code);
    if (dangerousPatterns.length > 0) {
      return { valid: false, errors: dangerousPatterns };
    }

    // 3. AST解析
    const ast = this.parseAST(code);
    const securityIssues = this.analyzeAST(ast);
    if (securityIssues.length > 0) {
      return { valid: false, errors: securityIssues };
    }

    // 4. 依存関係スキャン
    const vulns = await this.scanDependencies(code);

    return { valid: true, warnings: vulns };
  }

  private checkDangerousPatterns(code: string): string[] {
    const issues: string[] = [];

    this.blacklist.forEach(pattern => {
      if (code.includes(pattern)) {
        issues.push(`Dangerous pattern detected: ${pattern}`);
      }
    });

    return issues;
  }
}
```

### 2. サンドボックスセキュリティ

**Docker Compose設定**:
```yaml
version: '3.8'

services:
  user-sandbox:
    image: node:20-alpine
    networks:
      - isolated
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    security_opt:
      - no-new-privileges:true
      - seccomp:unconfined
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next
    environment:
      - NODE_ENV=production
    command: npm start

networks:
  isolated:
    driver: bridge
    internal: true  # 外部ネットワークアクセス禁止
```

### 3. API セキュリティ

```typescript
// Rate Limiting
@UseGuards(ThrottlerGuard)
@Throttle(100, 60)  // 60秒あたり100リクエスト
@Controller('api')
export class APIController {

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Body() dto: GenerateDTO, @User() user: UserEntity) {
    // CSRF保護（NestJSデフォルト）
    // 入力検証（class-validator）
    // SQLインジェクション対策（Prisma自動）

    return this.codegenService.generate(dto);
  }
}

// Zod検証
const GenerateSchema = z.object({
  projectId: z.string().uuid(),
  components: z.array(ComponentSchema).max(100),
  options: z.object({
    framework: z.enum(['nextjs', 'vite', 'svelte']),
  }),
});
```

---

## サンドボックス実装方針

### アーキテクチャ選択

**Phase 1: Docker（MVP）**
- 実装の容易さ: ★★★★★
- セキュリティ: ★★★☆☆
- パフォーマンス: ★★★☆☆

**Phase 2: Firecracker microVM（本番）**
- 実装の容易さ: ★★☆☆☆
- セキュリティ: ★★★★★
- パフォーマンス: ★★★★★

### Docker サンドボックス実装

```typescript
import Docker from 'dockerode';

class SandboxManager {
  private docker = new Docker();

  async createSandbox(projectId: string, code: GeneratedCode): Promise<Sandbox> {
    // 1. 専用ネットワーク作成
    const network = await this.docker.createNetwork({
      Name: `sandbox-${projectId}`,
      Driver: 'bridge',
      Internal: true,  // インターネットアクセス禁止
    });

    // 2. コンテナ作成
    const container = await this.docker.createContainer({
      Image: 'node:20-alpine',
      name: `sandbox-${projectId}`,
      NetworkMode: network.id,
      HostConfig: {
        Memory: 512 * 1024 * 1024,  // 512MB
        MemorySwap: 512 * 1024 * 1024,
        CpuQuota: 100000,  // 1 CPU
        PidsLimit: 100,
        ReadonlyRootfs: true,
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=100m',
        },
        CapDrop: ['ALL'],
        CapAdd: ['NET_BIND_SERVICE'],
        SecurityOpt: ['no-new-privileges'],
      },
      Env: [
        'NODE_ENV=production',
        `PROJECT_ID=${projectId}`,
      ],
    });

    // 3. コードをコンテナにコピー
    await this.copyCodeToContainer(container, code);

    // 4. コンテナ起動
    await container.start();

    // 5. ヘルスチェック
    await this.waitForHealthy(container);

    return {
      containerId: container.id,
      url: `http://localhost:${await this.getPort(container)}`,
    };
  }

  async executeCode(containerId: string, code: string): Promise<ExecutionResult> {
    const container = this.docker.getContainer(containerId);

    // タイムアウト付き実行
    const exec = await container.exec({
      Cmd: ['node', '-e', code],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({});

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        exec.kill();
        reject(new Error('Execution timeout'));
      }, 30000);  // 30秒

      let stdout = '';
      let stderr = '';

      stream.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      stream.on('error', (chunk) => {
        stderr += chunk.toString();
      });

      stream.on('end', () => {
        clearTimeout(timeout);
        resolve({ stdout, stderr });
      });
    });
  }

  async destroySandbox(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);
    await container.stop();
    await container.remove();
  }
}
```

### リソース監視

```typescript
class ResourceMonitor {
  async monitorContainer(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId);

    const stream = await container.stats({ stream: true });

    stream.on('data', (data) => {
      const stats = JSON.parse(data.toString());

      const cpuUsage = this.calculateCPUUsage(stats);
      const memoryUsage = stats.memory_stats.usage;

      // 閾値チェック
      if (cpuUsage > 90) {
        this.alertHighCPU(containerId);
      }

      if (memoryUsage > 450 * 1024 * 1024) {  // 450MB
        this.alertHighMemory(containerId);
      }

      // メトリクス保存
      this.saveMetrics(containerId, { cpuUsage, memoryUsage });
    });
  }
}
```

---

## 実装ロードマップ

### Phase 1: 基盤構築（Week 1）

#### Day 1-2: プロジェクトセットアップ
- [ ] モノレポ構造のセットアップ（Turborepo/Nx）
- [ ] エディター（React + Vite）
- [ ] バックエンド（NestJS）
- [ ] データベース（PostgreSQL + Prisma）
- [ ] Docker Compose環境

#### Day 3-4: エディター基盤
- [ ] DnDキャンバス実装
- [ ] コンポーネントパレット
- [ ] 基本コンポーネント（Button, Input, Text）
- [ ] プロパティパネル
- [ ] Zustand状態管理

#### Day 5-7: データモデリング
- [ ] React FlowベースのER図エディター
- [ ] スキーマ定義UI
- [ ] Prismaスキーマ生成
- [ ] マイグレーション生成

### Phase 2: コード生成（Week 2）

#### Day 8-10: コード生成エンジン
- [ ] テンプレートシステム（Handlebars）
- [ ] AST生成（TypeScript Compiler API）
- [ ] Next.jsジェネレーター
- [ ] コンポーネント生成パイプライン

#### Day 11-12: API生成
- [ ] REST API自動生成
- [ ] GraphQL API生成（オプション）
- [ ] CRUD操作実装
- [ ] 認証ミドルウェア生成

#### Day 13-14: ワークフローエディター
- [ ] React Flow統合
- [ ] 基本ノード（API Call, Condition, Loop）
- [ ] ワークフロー → コード変換
- [ ] イベントハンドラー生成

### Phase 3: Ollama統合（Week 3）

#### Day 15-17: AI基盤
- [ ] Ollama接続モジュール
- [ ] プロンプトエンジニアリング
- [ ] 自然言語 → コンポーネント生成
- [ ] コードレビュー機能

#### Day 18-19: AI強化機能
- [ ] バグ検出・修正提案
- [ ] パフォーマンス最適化提案
- [ ] アクセシビリティチェック
- [ ] コードリファクタリング

#### Day 20-21: サンドボックス
- [ ] Docker サンドボックス実装
- [ ] リソース制限
- [ ] セキュリティ検証
- [ ] コード実行エンジン

### Phase 4: 完成・最適化（Week 4）

#### Day 22-24: デプロイメント
- [ ] Vercel/Netlify統合
- [ ] Docker Composeビルド
- [ ] 環境変数管理
- [ ] SSL証明書自動取得

#### Day 25-26: セキュリティ強化
- [ ] コード検証パイプライン
- [ ] XSS/CSRF保護
- [ ] Rate Limiting
- [ ] 依存関係スキャン

#### Day 27-28: テスト・ドキュメント
- [ ] Unit tests（Jest）
- [ ] E2E tests（Playwright）
- [ ] ユーザーガイド
- [ ] API ドキュメント

#### Day 29-30: 最適化・リリース
- [ ] パフォーマンスチューニング
- [ ] バンドルサイズ最適化
- [ ] CI/CD（GitHub Actions）
- [ ] 本番デプロイ

---

## 技術的な決定事項

### 1. モノレポ vs マルチレポ
**決定**: Turborepo によるモノレポ

**理由**:
- コード共有の容易さ
- 統一されたビルドパイプライン
- 型安全な依存関係

### 2. 状態管理: Zustand vs Redux
**決定**: Zustand

**理由**:
- シンプルなAPI
- Reactフックとの親和性
- ボイラープレートが少ない

### 3. コード生成: テンプレート vs AST
**決定**: ハイブリッド

**理由**:
- 静的部分: Handlebarsテンプレート（可読性）
- 動的部分: TypeScript Compiler API（柔軟性）

### 4. リアルタイム協業: WebSocket vs CRDT
**決定**: Yjs（CRDT）+ WebSocket

**理由**:
- オフライン対応
- 競合解決の自動化
- スケーラビリティ

---

## パフォーマンス目標

### エディター
- 初回ロード: < 3秒
- コンポーネント追加: < 100ms
- 100個のコンポーネントでも60fps維持

### コード生成
- 小規模プロジェクト（10コンポーネント）: < 5秒
- 中規模プロジェクト（50コンポーネント）: < 30秒
- 大規模プロジェクト（200コンポーネント）: < 2分

### サンドボックス
- コンテナ起動: < 3秒
- コード実行: < 5秒
- 同時実行: 100コンテナ

---

## 次のステップ

1. **プロジェクト構造のセットアップ**
2. **依存関係のインストール**
3. **Docker Compose設定**
4. **基本的なエディターUI実装**

準備完了。実装を開始しましょう！
