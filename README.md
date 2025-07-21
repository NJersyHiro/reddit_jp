# Itaita (いたいた) - Japanese Community Discussion Platform

A Reddit-style discussion platform optimized for Japanese internet culture, built with modern web technologies.

![Itaita Platform](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

## 🎯 Overview

Itaita is a Japanese community discussion platform that combines Reddit-style threading with features tailored for Japanese internet culture. The platform supports both anonymous and registered users, making it ideal for open discussions while maintaining accountability.

## ✨ Features

- 📝 **Anonymous Posting**: Support for both registered and anonymous posts with optional pseudonyms
- 🔼 **Voting System**: Upvote/downvote functionality with karma tracking
- 💬 **Nested Comments**: Hierarchical comment threads with infinite nesting
- 🏷️ **Categories**: Organized discussion topics with bilingual support (Japanese/English)
- 📱 **Mobile-First**: Responsive design with PWA support and bottom navigation
- 🌓 **Dark Mode**: Built-in dark theme support
- 🔍 **Search**: Full-text search across threads and comments
- 🔐 **Authentication**: JWT-based auth with refresh tokens
- 🚀 **Real-time Updates**: Live notifications for replies and mentions
- 🌐 **i18n Ready**: Fully localized Japanese interface

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Fastify (High-performance web framework)
- **ORM**: Prisma (Type-safe database access)
- **Database**: PostgreSQL 14+ (with LTREE for comment threading)
- **Cache**: Redis 6+ (Session management and caching)
- **Queue**: Bull (Background job processing)
- **Auth**: JWT with refresh tokens

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand (Client state) + TanStack Query (Server state)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Heroicons
- **UI**: Custom components with accessibility focus

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- Docker Desktop (for PostgreSQL, Redis, and Maildev)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/itaita.git
cd itaita
```

2. **Install dependencies**
```bash
npm install
```

3. **Start Docker services**
```bash
docker compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Maildev on port 1080 (SMTP on 1025)

4. **Set up environment variables**

Backend (`backend/.env`):
```env
NODE_ENV=development
PORT=3002

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
EMAIL_FROM=noreply@itaita.jp

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=Itaita
```

5. **Run database migrations**
```bash
cd backend
npm run prisma:migrate
```

6. **Seed the database with categories**
```bash
npm run seed
```

### Development

Run the development servers:

```bash
# From the root directory
npm run dev
```

This starts both frontend and backend concurrently:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3002
- Maildev UI: http://localhost:1080

### Production Build

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## 📁 Project Structure

```
itaita/
├── backend/
│   ├── prisma/
│   │   ├── migrations/     # Database migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts        # Seed data
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── middlewares/   # Fastify middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Helper functions
│   │   └── index.ts       # Server entry point
│   └── tests/             # Backend tests
├── frontend/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── c/            # Category pages
│   │   ├── thread/       # Thread pages
│   │   ├── u/            # User profile pages
│   │   └── create/       # Create thread page
│   ├── components/       # React components
│   │   ├── Auth/         # Authentication components
│   │   ├── Category/     # Category components
│   │   ├── Comment/      # Comment components
│   │   ├── Layout/       # Layout components
│   │   ├── Navigation/   # Navigation components
│   │   ├── Thread/       # Thread components
│   │   └── UI/           # Reusable UI components
│   ├── lib/              # Client libraries
│   │   ├── api.ts        # API client
│   │   ├── auth.ts       # Auth store
│   │   └── utils.ts      # Utility functions
│   ├── public/           # Static assets
│   └── types/            # TypeScript types
└── docker-compose.yml    # Docker services configuration
```

## 🔧 Common Issues & Solutions

### Category Dropdown Not Showing Options
**Fixed in latest version**: The API response interceptor was extracting data, but the component expected a different structure. Updated to handle the array response directly.

### Docker Not Available in WSL
Enable Docker Desktop's WSL integration:
1. Open Docker Desktop
2. Go to Settings → Resources → WSL Integration
3. Enable integration with your WSL distro

### Database Connection Issues
Ensure Docker services are running:
```bash
docker compose ps
docker compose logs postgres
```

## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:slug` - Get category by slug

### Threads
- `GET /api/v1/threads` - List threads (with pagination)
- `GET /api/v1/threads/:id` - Get thread details
- `POST /api/v1/threads` - Create new thread
- `PUT /api/v1/threads/:id` - Update thread
- `DELETE /api/v1/threads/:id` - Delete thread

### Comments
- `GET /api/v1/threads/:threadId/comments` - Get thread comments
- `POST /api/v1/comments` - Create comment
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Voting
- `POST /api/v1/votes` - Vote on thread/comment
- `DELETE /api/v1/votes/:id` - Remove vote

### Users
- `GET /api/v1/users/:username` - Get user profile
- `GET /api/v1/users/:username/threads` - Get user's threads
- `GET /api/v1/users/:username/comments` - Get user's comments
- `PUT /api/v1/users/me` - Update current user profile

## 🧪 Testing

Run tests:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Reddit's community-driven discussion format
- Optimized for Japanese internet culture and communication patterns
- Built with modern web development best practices
- Special thanks to the open-source community

## 📞 Support

- Create an [issue](https://github.com/yourusername/itaita/issues) for bug reports
- Start a [discussion](https://github.com/yourusername/itaita/discussions) for questions
- Check the [wiki](https://github.com/yourusername/itaita/wiki) for detailed guides

---

Made with ❤️ for the Japanese online community