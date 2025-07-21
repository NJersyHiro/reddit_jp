# Itaita Backend

## Quick Start

### Option 1: Using Docker (Recommended)

1. Install Docker and Docker Compose
2. Run the setup script:
   ```bash
   ./scripts/setup-dev.sh
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Option 2: Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create database and user:
   ```sql
   CREATE USER itaita_user WITH PASSWORD 'itaita_dev_password';
   CREATE DATABASE itaita_dev OWNER itaita_user;
   GRANT ALL PRIVILEGES ON DATABASE itaita_dev TO itaita_user;
   ```
3. Install and start Redis
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Run migrations:
   ```bash
   npm run prisma:migrate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens (change in production!)
- `FRONTEND_URL` - Frontend application URL

## API Documentation

The API runs on `http://localhost:3000` by default.

### Main Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/threads` - List threads
- `POST /api/threads` - Create thread
- `GET /api/threads/:id` - Get thread details
- `POST /api/threads/:id/comments` - Add comment
- `POST /api/votes` - Vote on thread/comment
- `GET /api/search` - Search content

## Development Tips

1. Use Prisma Studio to view and edit database data:
   ```bash
   npm run prisma:studio
   ```

2. View Docker logs:
   ```bash
   docker compose logs -f
   ```

3. Reset database:
   ```bash
   docker compose down -v
   ./scripts/setup-dev.sh
   ```

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- If using Docker: `docker compose ps`
- If using local PostgreSQL: `sudo systemctl status postgresql`

### "Prisma client not initialized"
- Run `npm run prisma:generate`
- Check for schema errors: `npx prisma format`

### Port already in use
- Change PORT in .env
- Or stop conflicting service