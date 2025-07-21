import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SearchService } from '../services/search.service';
import { optionalAuth } from '../middlewares/auth.middleware';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['threads', 'comments', 'users']).optional().default('threads'),
  categoryId: z.string().uuid().optional(),
  page: z.string().optional().default('1').transform(Number).pipe(z.number().min(1)),
  perPage: z.string().optional().default('20').transform(Number).pipe(z.number().min(1).max(100)),
  limit: z.string().optional().transform((val) => val ? Number(val) : undefined), // For backward compatibility
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
        const { q, type, categoryId, page, perPage, limit } = validatedQuery;
        const userId = request.user?.id;

        const result = await searchService.search({
          query: q,
          type,
          categoryId,
          page,
          limit: perPage || limit || 20, // Use perPage first, then limit, then default
          userId,
        });

        return reply.code(200).send({
          success: true,
          ...result,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0',
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: 'Invalid query parameters',
            details: error.issues,
          });
        }
        request.log.error(error);
        return reply.code(500).send({
          success: false,
          error: {
            code: 'SEARCH_ERROR',
            message: 'Search failed',
          },
        });
      }
    }
  );
}