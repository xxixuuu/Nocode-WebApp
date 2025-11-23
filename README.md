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

- Node.js 20+
- Docker & Docker Compose
- Ollama (for AI features)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/zerocode.git
cd zerocode
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
# Backend
cp backend/.env.example backend/.env

# Edit backend/.env with your configuration
```

4. **Start infrastructure services**

```bash
docker-compose up -d postgres redis mongodb ollama
```

5. **Run database migrations**

```bash
npm run db:migrate
```

6. **Pull Ollama models (first time)**

```bash
docker exec -it zerocode-ollama ollama pull deepseek-coder:6.7b
docker exec -it zerocode-ollama ollama pull codellama:13b
docker exec -it zerocode-ollama ollama pull starcoder2:15b
```

7. **Start development servers**

```bash
# Terminal 1: Start all services with Turbo
npm run dev

# Or start individually:
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd editor && npm run dev
```

8. **Open the application**

- Editor: http://localhost:3000
- API: http://localhost:4000
- API Docs: http://localhost:4000/docs

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

### Phase 1 (Current)
- [x] Visual editor with drag-and-drop
- [x] Basic component library
- [x] Code generation (Next.js)
- [x] Ollama integration
- [ ] Data modeling
- [ ] Workflow builder

### Phase 2
- [ ] Real-time collaboration
- [ ] Advanced components
- [ ] Template marketplace
- [ ] Plugin system

### Phase 3
- [ ] Mobile app builder
- [ ] Custom database support
- [ ] Advanced deployments (K8s)
- [ ] White-label solution

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
