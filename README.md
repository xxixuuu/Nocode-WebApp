# ZeroCode - No-Code Web App Builder

![ZeroCode Banner](https://via.placeholder.com/1200x300/3b82f6/ffffff?text=ZeroCode+-+AI-Powered+No-Code+Platform)

## 🚀 Overview

ZeroCode is a next-generation no-code platform that lets you build full-stack web applications through a visual drag-and-drop interface. Powered by local LLMs (Ollama), it provides true AI pair programming capabilities for code generation, debugging, and optimization.

### ✨ Key Features

- 🎨 **Visual Editor**: Drag-and-drop UI builder with real-time preview
- 🗄️ **Data Modeling**: ER diagram editor with automatic API generation
- ⚡ **Workflow Builder**: Node-based business logic designer
- 🤖 **AI Assistant**: Ollama integration for code generation, review, and debugging
- 🔒 **Sandboxed Execution**: Secure Docker-based code execution
- 🚢 **One-Click Deploy**: Deploy to Vercel, Netlify, or self-hosted environments
- 👥 **Real-Time Collaboration**: Multi-user editing with CRDT

## 📋 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + Radix UI
- React DnD / @dnd-kit
- Monaco Editor
- React Flow
- Zustand (State Management)

### Backend
- NestJS (Node.js + TypeScript)
- Prisma ORM
- GraphQL (Apollo Server)
- Bull MQ (Job Queue)
- Ollama (Local LLM)

### Code Generation
- TypeScript Compiler API
- Handlebars (Templates)
- Prettier (Formatting)
- ESBuild (Bundling)

### Infrastructure
- PostgreSQL 16
- Redis 7
- MongoDB 7
- Docker
- Nginx

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Editor    │─────▶│   Backend   │─────▶│   Codegen   │
│   (React)   │      │  (NestJS)   │      │   Engine    │
└─────────────┘      └─────────────┘      └─────────────┘
       │                     │                     │
       │                     ▼                     ▼
       │              ┌─────────────┐      ┌─────────────┐
       │              │   Ollama    │      │  Generated  │
       │              │  AI Models  │      │    Code     │
       │              └─────────────┘      └─────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL + Redis + MongoDB             │
└─────────────────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop
- Git

### 🎯 自動セットアップ（推奨）

```bash
# 1. リポジトリクローン
git clone <your-repo-url>
cd Nocode-WebApp

# 2. 実装ブランチに切り替え
git checkout claude/nocode-web-builder-013kHaGea8tGjMjhaThfmSPf

# 3. 自動セットアップスクリプト実行
./setup.sh

# 4. 依存関係インストール
npm install

# 5. Dockerサービス起動
docker-compose up -d

# 6. Prismaセットアップ
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..

# 7. Ollamaモデルダウンロード（AI機能を使う場合）
docker exec -it zerocode-ollama ollama pull deepseek-coder

# 8. 開発サーバー起動
npm run dev
```

### 📱 アクセス

- **Editor (Frontend)**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `cd backend && npx prisma studio` → http://localhost:5555

### 🔧 手動セットアップ

<details>
<summary>手動でセットアップする場合はこちら</summary>

1. **docker-compose.yml 作成**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: zerocode-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: zerocode
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: zerocode-redis
    ports:
      - '6379:6379'

  mongodb:
    image: mongo:7
    container_name: zerocode-mongodb
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin

  ollama:
    image: ollama/ollama:latest
    container_name: zerocode-ollama
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:
  mongodb_data:
  ollama_data:
```

2. **backend/.env 作成**

`backend/.env.example` を参照して `.env` を作成

</details>

## 📖 Usage

### Creating Your First Project

1. **Open the Editor** at http://localhost:3000
2. **Drag components** from the left palette to the canvas
3. **Configure properties** in the right panel
4. **Preview** your design in real-time
5. **Generate code** by clicking "Export Code"

### Using AI Features

#### Generate Component from Natural Language

```typescript
POST /api/ai/generate-component
{
  "prompt": "Create a login form with email and password fields"
}
```

#### Review Code

```typescript
POST /api/ai/review-code
{
  "code": "your component code here"
}
```

#### Debug Code

```typescript
POST /api/ai/debug-code
{
  "code": "buggy code",
  "error": "error message"
}
```

### Data Modeling

1. Switch to **Data** tab
2. Create entities with fields
3. Define relationships
4. Auto-generate Prisma schema and API routes

### Workflow Builder

1. Switch to **Workflow** tab
2. Add nodes (API Call, Condition, Loop)
3. Connect nodes with edges
4. Generate TypeScript functions

## 🎯 Supported Frameworks

ZeroCode can generate code for:

- ✅ **Next.js 14** (App Router)
- ✅ **Vite + React**
- 🚧 **Svelte** (coming soon)
- 🚧 **Vue 3** (coming soon)

## 🔒 Security

### Code Validation
- AST-based security checks
- Blacklist for dangerous functions (`eval`, `Function`, etc.)
- Dependency vulnerability scanning

### Sandboxed Execution
- Docker containers with resource limits
- Network isolation
- CPU/Memory quotas
- Automatic cleanup

### Application Security
- Helmet.js (Security headers)
- CSRF protection
- XSS prevention
- SQL injection prevention (Prisma)
- Rate limiting

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Building for Production

```bash
# Build all packages
npm run build

# Build specific package
cd editor && npm run build
cd backend && npm run build
```

## 🚢 Deployment

### Docker Compose (Self-Hosted)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (Frontend)

```bash
cd editor
vercel --prod
```

### Railway (Backend)

```bash
cd backend
railway up
```

## 🗺️ Roadmap

### ✅ Phase 1 - Core Platform (Completed)
- [x] Visual editor with drag-and-drop
- [x] 33 component library (Layout, Form, Data, Media, Navigation, Feedback)
- [x] Code generation engine (React/Next.js)
- [x] Ollama AI integration (generate, review, optimize)
- [x] Data modeling (ER diagram + Prisma schema generation)
- [x] Workflow builder (5 node types + TypeScript code generation)
- [x] Authentication system (JWT + Magic Link)
- [x] Docker sandbox (secure code execution)

### ✅ Phase 2 - Advanced Features (Completed)
- [x] Real-time collaboration (WebSocket + Socket.IO)
- [x] Export functionality (ZIP download)
- [x] Preview mode (Visual + Code)
- [x] Deployment integration (Vercel + Railway)
- [x] AI Assistant UI (chat interface)

### 🚧 Phase 3 - Enhancement (In Progress)
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Template marketplace
- [ ] Component plugin system
- [ ] E2E testing suite
- [ ] Performance optimization
- [ ] Documentation site

### 📋 Phase 4 - Enterprise (Planned)
- [ ] Mobile app builder
- [ ] Multi-database support
- [ ] Kubernetes deployments
- [ ] White-label solution
- [ ] Team management
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Bubble.io](https://bubble.io) and [Webflow](https://webflow.com)
- Powered by [Ollama](https://ollama.ai) for local AI capabilities
- Built with amazing open-source tools

## 📞 Support

- 📧 Email: support@zerocode.dev
- 💬 Discord: [Join our community](https://discord.gg/zerocode)
- 📖 Documentation: [docs.zerocode.dev](https://docs.zerocode.dev)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/zerocode/issues)

---

Made with ❤️ by the ZeroCode team
