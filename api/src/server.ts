import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const server = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function main() {
  // Configure CORS for Client and Admin Vercel apps
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
  ];

  await server.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // Keep-alive health check endpoint
  server.get('/health', async () => {
    return {
      status: 'ok',
      service: 'handular-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Base API index
  server.get('/', async () => {
    return {
      name: 'Handular Core API',
      version: '0.1.0',
      database: 'PostgreSQL (Docker local)',
      docs: '/api/v1',
      health: '/health',
    };
  });

  // API v1: Live Database Queries
  server.get('/api/v1/requests', async () => {
    const requests = await prisma.buyerRequest.findMany({
      include: {
        offers: {
          include: {
            seller: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: requests, count: requests.length };
  });

  server.get('/api/v1/sellers', async () => {
    const sellers = await prisma.seller.findMany({
      orderBy: { rating: 'desc' },
    });
    return { data: sellers, count: sellers.length };
  });

  server.get('/api/v1/offers', async () => {
    const offers = await prisma.offer.findMany({
      include: {
        seller: true,
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: offers, count: offers.length };
  });

  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`Handular API server running on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
