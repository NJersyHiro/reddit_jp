import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ERROR_CODES, ApiResponse } from '../types/api';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const timestamp = new Date().toISOString();
  let statusCode = 500;
  let errorResponse: ApiResponse = {
    success: false,
    error: {
      code: ERROR_CODES.SERVER_ERROR,
      message: 'Internal server error',
    },
    meta: {
      timestamp,
      version: '1.0',
    },
  };

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    errorResponse.error = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }
  // Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = 409;
      const field = (error.meta?.target as string[])?.[0] || 'field';
      errorResponse.error = {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: `${field} already exists`,
      };
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorResponse.error = {
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'Record not found',
      };
    }
  }
  // JWT errors
  else if (error.message?.includes('jwt') || error.message?.includes('token')) {
    statusCode = 401;
    errorResponse.error = {
      code: ERROR_CODES.AUTH_REQUIRED,
      message: 'Invalid or expired token',
    };
  }
  // Rate limit errors
  else if (error.statusCode === 429) {
    statusCode = 429;
    errorResponse.error = {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests',
    };
  }
  // Custom application errors
  else if (error.statusCode && error.statusCode < 500) {
    statusCode = error.statusCode;
    errorResponse.error = {
      code: error.code || ERROR_CODES.SERVER_ERROR,
      message: error.message,
    };
  }

  // Log errors
  if (statusCode >= 500) {
    request.log.error(error);
  } else {
    request.log.warn(error);
  }

  return reply.status(statusCode).send(errorResponse);
}