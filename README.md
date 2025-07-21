# Itaita - Japanese Community Discussion Platform

A Reddit-style discussion platform optimized for Japanese internet culture, built with modern web technologies.

## Features

- 📝 **Anonymous Posting**: Support for both registered and anonymous posts with optional pseudonyms
- 🔼 **Voting System**: Upvote/downvote functionality with karma tracking
- 💬 **Nested Comments**: Hierarchical comment threads with infinite nesting
- 🏷️ **Categories**: Organized discussion topics with Japanese and English names
- 📱 **Mobile-First**: Responsive design with PWA support
- 🌓 **Dark Mode**: Built-in dark theme support
- 🔍 **Search**: Full-text search across threads and comments
- 🔐 **Authentication**: JWT-based auth with refresh tokens

## Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Fastify** - High-performance web framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Primary database with LTREE for comment threading
- **Redis** - Caching and session management
- **Bull** - Background job processing
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Heroicons** - Icon library

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/itaita.git
cd itaita
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Backend (`.env` in backend directory):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/itaita"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
```

Frontend (`.env.local` in frontend directory):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

4. Run database migrations:
```bash
cd backend
npx prisma migrate dev
```

5. Seed the database (optional):
```bash
npm run seed
```

### Development

Run both backend and frontend:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application at `http://localhost:3001`

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

## Project Structure

```
itaita/
├── backend/
│   ├── prisma/         # Database schema and migrations
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── middleware/ # Fastify middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Helper functions
│   └── tests/          # Backend tests
└── frontend/
    ├── app/            # Next.js app directory
    ├── components/     # React components
    ├── lib/            # Client libraries
    ├── public/         # Static assets
    └── types/          # TypeScript types
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Threads
- `GET /api/threads` - List threads
- `GET /api/threads/:id` - Get thread details
- `POST /api/threads` - Create thread
- `PATCH /api/threads/:id` - Update thread
- `DELETE /api/threads/:id` - Delete thread

### Comments
- `GET /api/threads/:threadId/comments` - Get thread comments
- `POST /api/comments` - Create comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Voting
- `POST /api/votes` - Vote on thread/comment
- `DELETE /api/votes` - Remove vote

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Get category details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Reddit's community-driven discussion format
- Optimized for Japanese internet culture and communication patterns
- Built with modern web development best practices
