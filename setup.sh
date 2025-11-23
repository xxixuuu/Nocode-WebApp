#!/bin/bash

echo "🚀 ZeroCode セットアップを開始します..."
echo ""

# カラー定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# docker-compose.yml の作成
echo -e "${BLUE}📦 docker-compose.yml を作成中...${NC}"
cat > docker-compose.yml << 'EOF'
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: zerocode-redis
    ports:
      - '6379:6379'
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  mongodb:
    image: mongo:7
    container_name: zerocode-mongodb
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    volumes:
      - mongodb_data:/data/db

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
EOF
echo -e "${GREEN}✅ docker-compose.yml 作成完了${NC}"
echo ""

# backend/.env の作成
echo -e "${BLUE}📝 backend/.env を作成中...${NC}"
mkdir -p backend
cat > backend/.env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zerocode?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# MongoDB
MONGODB_URI="mongodb://admin:admin@localhost:27017/zerocode?authSource=admin"

# JWT Authentication
JWT_SECRET="zerocode-jwt-secret-change-in-production-$(openssl rand -hex 32)"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="zerocode-refresh-secret-change-in-production-$(openssl rand -hex 32)"
JWT_REFRESH_EXPIRATION="7d"

# Ollama AI
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="deepseek-coder"

# Deployment (Optional - 後で設定可能)
VERCEL_TOKEN=""
RAILWAY_TOKEN=""

# Rate Limiting
THROTTLE_TTL="60"
THROTTLE_LIMIT="100"

# Server
PORT="3001"
NODE_ENV="development"
EOF
echo -e "${GREEN}✅ backend/.env 作成完了${NC}"
echo ""

# .env.example も作成（Gitにコミット用）
echo -e "${BLUE}📝 backend/.env.example を作成中...${NC}"
cat > backend/.env.example << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zerocode?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# MongoDB
MONGODB_URI="mongodb://admin:admin@localhost:27017/zerocode?authSource=admin"

# JWT Authentication (本番環境では必ず変更してください！)
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRATION="7d"

# Ollama AI
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="deepseek-coder"

# Deployment (Optional)
VERCEL_TOKEN=""
RAILWAY_TOKEN=""

# Rate Limiting
THROTTLE_TTL="60"
THROTTLE_LIMIT="100"

# Server
PORT="3001"
NODE_ENV="development"
EOF
echo -e "${GREEN}✅ backend/.env.example 作成完了${NC}"
echo ""

# .gitignore の更新
echo -e "${BLUE}🔒 .gitignore を更新中...${NC}"
if [ ! -f .gitignore ]; then
    touch .gitignore
fi

# .env が既に .gitignore にあるか確認
if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo -e "${GREEN}✅ .gitignore に .env を追加${NC}"
else
    echo -e "${YELLOW}⚠️  .env は既に .gitignore に含まれています${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ セットアップ完了！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}次のステップ:${NC}"
echo ""
echo "1. 依存関係のインストール:"
echo "   ${YELLOW}npm install${NC}"
echo ""
echo "2. Dockerサービスの起動:"
echo "   ${YELLOW}docker-compose up -d${NC}"
echo ""
echo "3. Prismaセットアップ:"
echo "   ${YELLOW}cd backend${NC}"
echo "   ${YELLOW}npx prisma generate${NC}"
echo "   ${YELLOW}npx prisma migrate dev --name init${NC}"
echo "   ${YELLOW}cd ..${NC}"
echo ""
echo "4. Ollamaモデルのダウンロード (オプション):"
echo "   ${YELLOW}docker exec -it zerocode-ollama ollama pull deepseek-coder${NC}"
echo ""
echo "5. 開発サーバーの起動:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${GREEN}🎉 準備完了後、http://localhost:5173 でアクセス可能です！${NC}"
echo ""
