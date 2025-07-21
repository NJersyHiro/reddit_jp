import { User } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateSessionToken } from '../utils/token';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { ERROR_CODES } from '../types/api';
import dayjs from 'dayjs';

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.username ? [{ username: data.username }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already registered');
      }
      if (data.username && existingUser.username === data.username) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user,
      tokens,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Check if user is banned
    if (user.isBanned) {
      if (user.bannedUntil && dayjs().isAfter(user.bannedUntil)) {
        // Unban user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isBanned: false,
            bannedUntil: null,
            banReason: null,
          },
        });
      } else {
        throw new Error('Account is banned');
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async logout(userId: string, token: string) {
    // Add token to blacklist
    const key = `blacklist:${token}`;
    const ttl = 60 * 60 * 24 * 7; // 7 days
    await redis.setex(key, ttl, userId);

    // Remove all user sessions
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async refreshToken(refreshToken: string) {
    // Find session
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Check if expired
    if (dayjs().isAfter(session.expiresAt)) {
      await prisma.session.delete({
        where: { id: session.id },
      });
      throw new Error('Refresh token expired');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(session.user);

    // Delete old session
    await prisma.session.delete({
      where: { id: session.id },
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
      },
      tokens,
    };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  private async generateTokens(user: Pick<User, 'id' | 'email' | 'username'>) {
    // Generate access token
    const accessToken = this.fastify.jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Generate refresh token
    const refreshToken = generateSessionToken();
    const expiresAt = dayjs().add(30, 'days').toDate();

    // Store session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    };
  }
}