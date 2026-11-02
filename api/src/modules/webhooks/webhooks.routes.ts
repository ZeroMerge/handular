import { FastifyInstance } from 'fastify';
import { debouncerService } from '../debouncer/debouncer.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function webhookRoutes(fastify: FastifyInstance) {
  // 1. WhatsApp Webhook (Evolution API / Baileys format)
  fastify.post('/webhooks/whatsapp', async (request, reply) => {
    const body = request.body as any;

    try {
      // Extract sender phone, text, and media URLs from Evolution API webhook structure
      const remoteJid = body?.data?.key?.remoteJid || body?.sender || '';
      const sellerPhone = remoteJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');

      if (!sellerPhone) {
        return reply.status(400).send({ error: 'Missing remoteJid / sender phone' });
      }

      const text =
        body?.data?.message?.conversation ||
        body?.data?.message?.extendedTextMessage?.text ||
        body?.data?.message?.imageMessage?.caption ||
        '';

      const audioUrl = body?.data?.message?.audioMessage?.url || undefined;
      const photoUrl = body?.data?.message?.imageMessage?.url || undefined;

      const result = await debouncerService.handleInboundMessage({
        sellerPhone,
        channel: 'WHATSAPP',
        text: text || undefined,
        audioUrl,
        photoUrl,
      });

      return reply.send({
        status: 'received',
        action: 'debouncing_45s',
        batchId: result.batchId,
        silenceExpires: result.silenceExpires,
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: err.message });
    }
  });

  // 2. Telegram Webhook (grammY format)
  fastify.post('/webhooks/telegram', async (request, reply) => {
    const update = request.body as any;

    try {
      const message = update?.message;
      if (!message) {
        return reply.send({ ok: true });
      }

      const telegramUserId = message.from?.id ? String(message.from.id) : '';
      const text = message.text || message.caption || '';
      const sellerPhone = message.contact?.phone_number || `tg_${telegramUserId}`;

      const result = await debouncerService.handleInboundMessage({
        sellerPhone,
        channel: 'TELEGRAM',
        text: text || undefined,
      });

      return reply.send({
        status: 'received',
        batchId: result.batchId,
        silenceExpires: result.silenceExpires,
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: err.message });
    }
  });

  // 3. Debouncer Sweeper (Cron / manual poll trigger)
  fastify.post('/api/v1/debouncer/sweep', async () => {
    const processed = await debouncerService.sweepExpiredBatches();
    return {
      success: true,
      processedCount: processed.length,
      processed,
    };
  });

  // 4. Force process specific batch (useful for testing without waiting 45s)
  fastify.post('/api/v1/debouncer/process/:batchId', async (request, reply) => {
    const { batchId } = request.params as { batchId: string };
    try {
      const result = await debouncerService.processBatch(batchId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 5. Developer & Demo Simulator: Simulate verified seller responding to a request
  fastify.post('/api/v1/simulation/simulate-seller-response', async (request, reply) => {
    const body = (request.body as any) || {};
    const {
      token,
      sellerPhone = '2348012345678',
      message = 'Hello boss, I have a clean MacBook Pro 14" M1 Pro 16GB 512GB, 94% battery health, Grade A. Price is ₦720,000.',
      photoUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    } = body;

    // Resolve buyer request if token provided
    let reqId = undefined;
    if (token) {
      const req = await prisma.buyerRequest.findUnique({
        where: { publicToken: token },
      });
      if (req) reqId = req.id;
    }

    // Feed message into debouncer
    const ingest = await debouncerService.handleInboundMessage({
      sellerPhone,
      channel: 'WHATSAPP',
      text: message,
      photoUrl,
      requestId: reqId,
    });

    // Process immediately for seamless demo/testing experience
    const processResult = await debouncerService.processBatch(ingest.batchId, reqId);

    return reply.status(201).send({
      message: 'Simulated seller response ingested and processed through AI pipeline!',
      ingest,
      processResult,
    });
  });
}
