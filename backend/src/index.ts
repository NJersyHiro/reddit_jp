import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { config } from './config/config';
import { prisma } from './config/database';
import { authRoutes } from './routes/auth.routes';
import { categoryRoutes } from './routes/category.routes';
import { threadRoutes } from './routes/thread.routes';
import { commentRoutes } from './routes/comment.routes';
import { voteRoutes } from './routes/vote.routes';
import { userRoutes } from './routes/user.routes';
import { searchRoutes } from './routes/search.routes';
import { errorHandler } from './middlewares/error.middleware';

const server = Fastify({
  logger: {
    level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  },
});

async function bootstrap() {
  try {
    // Register plugins
    await server.register(cors, {
      origin: config.FRONTEND_URL,
      credentials: true,
    });

    await server.register(helmet, {
      contentSecurityPolicy: false, // We'll configure this properly for production
    });

    await server.register(rateLimit, {
      max: config.RATE_LIMIT_MAX,
      timeWindow: config.RATE_LIMIT_WINDOW_MS,
    });

    await server.register(jwt, {
      secret: config.JWT_SECRET,
      sign: {
        expiresIn: config.JWT_EXPIRES_IN,
      },
    });

    // Decorate request with user (check if already exists)
    if (!server.hasRequestDecorator('user')) {
      server.decorateRequest('user', null);
    }
    
    // Decorate with prisma for routes (check if already exists)
    if (!server.hasDecorator('prisma')) {
      server.decorate('prisma', prisma);
    }

    // Add auth hook
    server.addHook('onRequest', async (request, reply) => {
      try {
        if (request.headers.authorization) {
          const token = request.headers.authorization.replace('Bearer ', '');
          const decoded = await request.jwtVerify({ onlyCookie: false });
          request.user = decoded;
        }
      } catch (err) {
        // Token is invalid, but we'll let the route handlers decide what to do
      }
    });

    // Health check
    server.get('/health', async (request, reply) => {
      const dbHealthy = await prisma.$queryRaw`SELECT 1`
        .then(() => true)
        .catch(() => false);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected',
      };
    });

    // Register routes
    await server.register(authRoutes, { prefix: '/api/v1/auth' });
    await server.register(userRoutes, { prefix: '/api/v1/users' });
    await server.register(categoryRoutes, { prefix: '/api/v1/categories' });
    await server.register(threadRoutes, { prefix: '/api/v1/threads' });
    await server.register(commentRoutes, { prefix: '/api/v1/comments' });
    await server.register(voteRoutes, { prefix: '/api/v1/votes' });
    await server.register(searchRoutes, { prefix: '/api/v1' });

    // Error handler
    server.setErrorHandler(errorHandler);

    // Start server
    await server.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server ready at http://localhost:${config.PORT}`);
  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Graceful shutdown initiated...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

bootstrap();