import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { requestRoutes } from './modules/requests/requests.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { webhookRoutes } from './modules/webhooks/webhooks.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { chatRoutes } from './modules/chats/chat.routes';
import { debouncerService } from './modules/debouncer/debouncer.service';
import { telegramService } from './modules/telegram/telegram.service';
import { authPlugin } from './plugins/auth';

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
    process.env.CLIENT_URL || 'http://localhost:5180',
    process.env.ADMIN_URL || 'http://localhost:5181',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5180',
    'http://localhost:5181',
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

  // Evolution WhatsApp QR pairing page
  server.get('/whatsapp/qr', async (req, reply) => {
    try {
      const evoUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
      const evoKey = process.env.EVOLUTION_API_KEY || 'local-evolution-key';
      const instance = process.env.EVOLUTION_INSTANCE_NAME || 'handular-bot';

      const stateRes = await fetch(`${evoUrl}/instance/connectionState/${instance}`, {
        headers: { apikey: evoKey }
      });
      const stateData: any = await stateRes.json().catch(() => ({}));
      const state = stateData?.instance?.state || 'unknown';

      if (state === 'open') {
        reply.type('text/html').send(`
          <!DOCTYPE html>
          <html>
          <head><title>WhatsApp Connected</title><meta charset="utf-8"></head>
          <body style="font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f8fafc;margin:0;">
            <div style="background:#1e293b;padding:3rem;border-radius:1rem;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid #22c55e;">
              <h1 style="color:#22c55e;margin-top:0;">WhatsApp Connected!</h1>
              <p style="color:#94a3b8;font-size:1.1rem;">Instance <strong>${instance}</strong> is active and connected to WhatsApp.</p>
              <p style="color:#64748b;font-size:0.9rem;">Status: <strong>OPEN</strong></p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      const qrRes = await fetch(`${evoUrl}/instance/connect/${instance}`, {
        headers: { apikey: evoKey }
      });
      const qrData: any = await qrRes.json().catch(() => ({}));
      const qrImage = qrData?.base64;
      const pairingCode = qrData?.pairingCode;

      reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Pair WhatsApp - Handular</title>
          <meta charset="utf-8">
          <meta http-equiv="refresh" content="5">
        </head>
        <body style="font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f8fafc;margin:0;">
          <div style="background:#1e293b;padding:2.5rem;border-radius:1rem;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);max-width:440px;border:1px solid #334155;">
            <h2 style="margin-top:0;color:#38bdf8;">Connect WhatsApp</h2>
            
            ${pairingCode ? `
              <div style="margin-bottom:1.5rem;">
                <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:0.5rem;">Option 1: Link with Phone Number Code</p>
                <div style="background:#0284c7;color:#ffffff;padding:0.75rem 1rem;border-radius:0.5rem;font-size:1.6rem;font-weight:bold;letter-spacing:5px;font-family:monospace;">
                  ${pairingCode}
                </div>
                <p style="color:#38bdf8;font-size:0.8rem;margin-top:0.4rem;">In WhatsApp &rarr; Linked Devices &rarr; "Link with phone number instead"</p>
              </div>
              <div style="border-top:1px solid #334155;margin:1.25rem 0;"></div>
              <p style="color:#94a3b8;font-size:0.9rem;margin-bottom:0.75rem;">Option 2: Scan QR Code</p>
            ` : `
              <p style="color:#94a3b8;font-size:0.95rem;margin-bottom:1.5rem;">
                Open WhatsApp on your phone &rarr; <strong>Settings</strong> &rarr; <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong>.
              </p>
            `}

            ${qrImage ? `<img src="${qrImage}" style="width:240px;height:240px;border-radius:0.75rem;background:#fff;padding:8px;" alt="QR Code" />` : '<p style="color:#f87171;">Generating QR code... Please wait.</p>'}
            <p style="color:#64748b;font-size:0.8rem;margin-top:1.5rem;">
              Auto-refreshing every 5 seconds | Instance: <strong>${instance}</strong>
            </p>
          </div>
        </body>
        </html>
      `);
    } catch (err: any) {
      reply.status(500).send({ error: 'Failed to fetch WhatsApp pairing state', details: err?.message });
    }
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

  // Register plugins
  await server.register(authPlugin);

  // Register feature route modules
  await server.register(requestRoutes);
  await server.register(adminRoutes);
  await server.register(webhookRoutes);
  await server.register(authRoutes);
  await server.register(chatRoutes);

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

  const port = Number(process.env.PORT) || 4001;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    server.log.info(`Handular API server running on http://${host}:${port}`);

    // Launch Telegram long-polling bot listener (dev & prod)
    await telegramService.startPolling();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
