# Itaita Development Environment Setup Guide

This guide will walk you through setting up the complete development environment for the Itaita project.

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v20.x or later) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## Step 1: Clone and Initialize Repository

```bash
# Clone the repository (replace with your actual repo URL)
git clone https://github.com/your-org/itaita.git
cd itaita

# Create directory structure
mkdir -p backend frontend shared scripts docs tests
```

## Step 2: Create Docker Development Environment

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: itaita_postgres
    environment:
      POSTGRES_USER: itaita_user
      POSTGRES_PASSWORD: itaita_dev_password
      POSTGRES_DB: itaita_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U itaita_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: itaita_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  maildev:
    image: maildev/maildev
    container_name: itaita_maildev
    ports:
      - "1080:1080"  # Web UI
      - "1025:1025"  # SMTP

volumes:
  postgres_data:
  redis_data:
```

## Step 3: Initialize Backend (Node.js + TypeScript)

```bash
cd backend

# Initialize package.json
npm init -y

# Install dependencies
npm install express fastify @fastify/cors @fastify/helmet @fastify/rate-limit
npm install @prisma/client prisma ioredis jsonwebtoken bcrypt
npm install dotenv zod dayjs nanoid
npm install @bull-board/api @bull-board/express bull

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken
npm install -D tsx nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D husky lint-staged
```

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

Create `backend/.env.example`:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://itaita_user:itaita_dev_password@localhost:5432/itaita_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email (Maildev in development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@itaita.jp

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Sentry (optional)
SENTRY_DSN=
```

Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx src/database/seed.ts"
  }
}
```

## Step 4: Initialize Frontend (Next.js + TypeScript)

```bash
cd ../frontend

# Create Next.js app with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install additional dependencies
npm install axios swr zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install react-hot-toast react-intersection-observer
npm install @heroicons/react date-fns
npm install next-pwa workbox-window

# Install dev dependencies
npm install -D @types/react @types/node
npm install -D @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install -D cypress @cypress/react @cypress/webpack-dev-server
```

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'cdn.itaita.jp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
```

Create `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Itaita
```

## Step 5: Setup ESLint and Prettier

Create `.eslintrc.js` in root:

```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

Create `.prettierrc` in root:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

## Step 6: Setup Git Hooks with Husky

```bash
# In root directory
npm init -y
npm install -D husky lint-staged

# Initialize husky
npx husky-init && npm install

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Create `.lintstagedrc.json` in root:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

## Step 7: Setup Testing Infrastructure

Create `backend/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Step 8: Initialize Prisma

```bash
cd backend

# Initialize Prisma
npx prisma init

# This creates prisma/schema.prisma and .env file
```

Update `backend/prisma/schema.prisma` with our models (based on DATABASE_SCHEMA.md).

## Step 9: Create Development Scripts

Create `scripts/dev.sh`:

```bash
#!/bin/bash

echo "Starting Itaita development environment..."

# Start Docker services
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Run database migrations
cd backend && npm run db:migrate

# Start backend in one terminal
echo "Starting backend server..."
npm run dev &

# Start frontend in another terminal
cd ../frontend
echo "Starting frontend server..."
npm run dev &

echo "Development environment is ready!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "Database: postgres://localhost:5432/itaita_dev"
echo "Redis: redis://localhost:6379"
echo "Mail UI: http://localhost:1080"
```

Make it executable:
```bash
chmod +x scripts/dev.sh
```

## Step 10: VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/coverage": true
  }
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

## Step 11: GitHub Actions CI/CD

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: itaita_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run Backend Lint
        working-directory: ./backend
        run: npm run lint

      - name: Run Frontend Lint
        working-directory: ./frontend
        run: npm run lint

      - name: Run Backend Type Check
        working-directory: ./backend
        run: npm run typecheck

      - name: Run Backend Tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/itaita_test
          REDIS_URL: redis://localhost:6379
        run: npm test

      - name: Run Frontend Tests
        working-directory: ./frontend
        run: npm test

      - name: Build Backend
        working-directory: ./backend
        run: npm run build

      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build
```

## Quick Start Commands

After setup, you can use these commands:

```bash
# Start everything
./scripts/dev.sh

# Or manually:
docker-compose up -d  # Start Docker services
cd backend && npm run dev  # Start backend
cd frontend && npm run dev  # Start frontend

# Run tests
cd backend && npm test
cd frontend && npm test

# Lint and format
npm run lint:fix
npm run format

# Database operations
cd backend
npm run db:migrate  # Run migrations
npm run db:seed    # Seed data
```

## Next Steps

1. Copy `.env.example` to `.env` in backend directory
2. Copy `.env.local.example` to `.env.local` in frontend directory
3. Run `docker-compose up -d` to start services
4. Run database migrations
5. Start development servers
6. Access the application at http://localhost:3001

## Troubleshooting

### Port conflicts
If ports are already in use, update the port mappings in docker-compose.yml

### Database connection issues
Ensure Docker is running and the PostgreSQL container is healthy

### Node version issues
Use nvm to manage Node.js versions: `nvm use 20`