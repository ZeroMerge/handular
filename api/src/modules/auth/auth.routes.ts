import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple, zero-dependency robust password hashing using native crypto
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
}

function generateToken(userId: string, email: string): string {
  const payload = { sub: userId, email, iat: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decodeToken(token: string): { sub: string; email: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number is required'),
  campus: z.string().default('UNILAG'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function authRoutes(fastify: FastifyInstance) {
  // 1. Student Registration
  fastify.post('/api/v1/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = RegisterSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parse.error.errors,
      });
    }

    const { email, password, fullName, phone, campus } = parse.data;

    // Check existing email
    const existing = await prisma.studentUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return reply.status(409).send({ error: 'An account with this email already exists' });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.studentUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone,
        campus,
      },
    });

    const token = generateToken(user.id, user.email);

    return reply.status(201).send({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
      },
    });
  });

  // 2. Student Login
  fastify.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parse = LoginSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parse.error.errors,
      });
    }

    const { email, password } = parse.data;

    const user = await prisma.studentUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email);

    return reply.send({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
      },
    });
  });

  // 3. Current User Profile & Request History
  fastify.get('/api/v1/auth/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (!decoded) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const user = await prisma.studentUser.findUnique({
      where: { id: decoded.sub },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
          include: {
            offers: {
              where: { isPublishedToBuyer: true },
              orderBy: { price: 'asc' },
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        campus: user.campus,
        avatarUrl: user.avatarUrl,
      },
      requests: user.requests.map((r) => ({
        id: r.id,
        publicToken: r.publicToken,
        category: r.category,
        maxBudget: r.maxBudget,
        status: r.status,
        createdAt: r.createdAt,
        offersCount: r.offers.length,
        lowestOffer: r.offers.length > 0 ? r.offers[0].price : null,
      })),
    });
  });

  // 4. Update Profile / Avatar
  fastify.post('/api/v1/auth/avatar', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (!decoded) {
      return reply.status(401).send({ error: 'Invalid token' });
    }

    const { avatarUrl } = (request.body as any) || {};
    if (!avatarUrl) {
      return reply.status(400).send({ error: 'avatarUrl is required' });
    }

    const updated = await prisma.studentUser.update({
      where: { id: decoded.sub },
      data: { avatarUrl },
    });

    return reply.send({
      message: 'Avatar updated successfully',
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        phone: updated.phone,
        campus: updated.campus,
        avatarUrl: updated.avatarUrl,
      },
    });
  });
}
