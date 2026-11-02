import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { requestRoutes } from './modules/requests/requests.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { webhookRoutes } from './modules/webhooks/webhooks.routes';
import { debouncerService } from './modules/debouncer/debouncer.service';

dotenv.config();

const prisma = new PrismaClient();
const server = fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function main() {
  // Configure CORS for Client and Admin Vercel / local dev apps
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
      modules: ['requests', 'admin', 'webhooks', 'debouncer', 'ai'],
    };
  });

  // Register feature route modules
  await server.register(requestRoutes);
  await server.register(adminRoutes);
  await server.register(webhookRoutes);

  // Setup periodic background debouncer sweeper (runs every 15s)
  setInterval(async () => {
    try {
      const processed = await debouncerService.sweepExpiredBatches();
      if (processed.length > 0) {
        server.log.info(`Swept and processed ${processed.length} expired inbound batches.`);
      }
    } catch (e: any) {
      server.log.error({ err: e }, 'Debouncer sweep error');
    }
  }, 15000);

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
