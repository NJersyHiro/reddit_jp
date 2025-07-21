import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SearchService } from '../services/search.service';
import { optionalAuth } from '../middlewares/auth.middleware';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['threads', 'comments', 'users']).optional().default('threads'),
  categoryId: z.string().uuid().optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1').catch('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20').catch('20'),
});

export async function searchRoutes(server: FastifyInstance) {
  const searchService = new SearchService();

  server.get<{
    Querystring: z.infer<typeof searchQuerySchema>;
  }>(
    '/search',
    {
      preHandler: optionalAuth,
    },
    async (request, reply) => {
      try {
        const validatedQuery = searchQuerySchema.parse(request.query);
        const { q, type, categoryId, page, limit } = validatedQuery;
        const userId = request.user?.id;

        const result = await searchService.search({
          query: q,
          type,
          categoryId,
          page,
          limit,
          userId,
        });

        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Invalid query parameters',
            details: error.errors,
          });
        }
        request.log.error(error);
        return reply.code(500).send({
          error: 'Search failed',
        });
      }
    }
  );
}