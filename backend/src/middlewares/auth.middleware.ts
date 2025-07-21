import { FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_CODES } from '../types/api';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    return reply.status(401).send({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_REQUIRED,
        message: 'Authentication required',
      },
    });
  }
}

export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
  // This middleware doesn't do anything, it's just for documentation
  // The user will be available on request.user if authenticated
}