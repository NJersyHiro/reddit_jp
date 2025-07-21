import { nanoid } from 'nanoid';

export function generateToken(length = 32): string {
  return nanoid(length);
}

export function generateSessionToken(): string {
  return generateToken(64);
}

export function generateVerificationToken(): string {
  return generateToken(32);
}