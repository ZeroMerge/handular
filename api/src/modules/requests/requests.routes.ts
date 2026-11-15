import { FastifyInstance } from 'fastify';
import { PrismaClient, ProductCategory, RequestStatus } from '@prisma/client';
import { z } from 'zod';
import { broadcastService } from '../broadcast/broadcast.service';

const prisma = new PrismaClient();

const CreateRequestSchema = z.object({
  buyerName: z.string().min(2),
  buyerPhone: z.string().min(10),
  buyerEmail: z.string().email().optional(),
  category: z.enum(['LAPTOPS', 'PHONES', 'ACCESSORIES']),
  brand: z.string().optional().default('any'),
  useCase: z.string().optional().default('general'),
  minBudget: z.number().optional().default(150000),
  maxBudget: z.number().min(50000),
  preferredSpecs: z.string().optional(),
  studentId: z.string().optional(),
  chatSessionId: z.string().optional(),
});

function generateToken(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let token = 'REQ-';
  for (let i = 0; i < 4; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function requestRoutes(fastify: FastifyInstance) {
  // 1. Submit a new device request (from Student Client)
  fastify.post('/api/v1/requests', async (request, reply) => {
    const parseResult = CreateRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parseResult.error.errors,
      });
    }

    const {
      buyerName,
      buyerPhone,
      buyerEmail,
      category,
      brand,
      useCase,
      minBudget,
      maxBudget,
      preferredSpecs,
    } = parseResult.data;

    let publicToken = generateToken();
    // Ensure token uniqueness
    while (await prisma.buyerRequest.findUnique({ where: { publicToken } })) {
      publicToken = generateToken();
    }

    // Resolve studentId if not provided but buyerEmail matches a registered student
    let resolvedStudentId = parseResult.data.studentId;
    if (!resolvedStudentId && buyerEmail) {
      const matchedStudent = await prisma.studentUser.findUnique({
        where: { email: buyerEmail.toLowerCase() },
      });
      if (matchedStudent) resolvedStudentId = matchedStudent.id;
    }

    // Generate 4-digit student verification PIN for campus pickup verification
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const trackingCode = `${publicToken}-${pin}`;

    // Create the BuyerRequest in PostgreSQL
    const newRequest = await prisma.buyerRequest.create({
      data: {
        publicToken,
        trackingCode,
        chatSessionId: parseResult.data.chatSessionId || undefined,
        studentId: resolvedStudentId || undefined,
        buyerName,
        buyerPhone,
        buyerEmail,
        category: category as ProductCategory,
        targetSpecs: {
          brand,
          useCase,
          notes: preferredSpecs || '',
        },
        minBudget,
        maxBudget,
        status: RequestStatus.BROADCASTED,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour sourcing window
      },
    });

    // If chatSessionId provided, link & update chat session status and tracking
    if (parseResult.data.chatSessionId) {
      await prisma.chatSession.update({
        where: { id: parseResult.data.chatSessionId },
        data: {
          trackingCode,
          status: 'SOURCING',
          title: brand && brand !== 'any' ? `${brand} (${useCase})` : `${category} (${useCase})`,
        },
      }).catch(() => {});
    }

    // Match verified sellers tagged with this category and broadcast distribution
    const broadcastResult = await broadcastService.broadcastRequest(newRequest.id);

    return reply.status(201).send({
      message: 'Request broadcasted successfully to verified campus sellers',
      data: {
        id: newRequest.id,
        publicToken: newRequest.publicToken,
        trackingCode: newRequest.trackingCode,
        status: newRequest.status,
        sellersBroadcasted: broadcastResult.broadcastedCount,
        expiresAt: newRequest.expiresAt,
        offersUrl: `/offers/${newRequest.publicToken}`,
      },
    });
  });

  // 2. Get Request Details by public token
  fastify.get('/api/v1/requests/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const reqRecord = await prisma.buyerRequest.findUnique({
      where: { publicToken: token },
      include: {
        broadcasts: {
          include: {
            seller: {
              select: { businessName: true, rating: true, completedDeals: true },
            },
          },
        },
      },
    });

    if (!reqRecord) {
      return reply.status(404).send({ error: 'Request not found' });
    }

    return { data: reqRecord };
  });

  // 3. Get Curated Offers for Student Showcase
  fastify.get('/api/v1/offers/:token', async (request, reply) => {
    const { token } = request.params as { token: string };

    const reqRecord = await prisma.buyerRequest.findUnique({
      where: { publicToken: token },
      include: {
        offers: {
          where: { isPublishedToBuyer: true },
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                rating: true,
                completedDeals: true,
              },
            },
          },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!reqRecord) {
      return reply.status(404).send({ error: 'Request not found' });
    }

    return {
      request: {
        publicToken: reqRecord.publicToken,
        buyerName: reqRecord.buyerName,
        category: reqRecord.category,
        maxBudget: reqRecord.maxBudget,
        status: reqRecord.status,
      },
      offers: reqRecord.offers,
      count: reqRecord.offers.length,
    };
  });

  // 4. Student Selects an Offer (Lock in Deal)
  fastify.post('/api/v1/offers/:token/select', async (request, reply) => {
    const { token } = request.params as { token: string };
    const { offerId } = request.body as { offerId: string };

    if (!offerId) {
      return reply.status(400).send({ error: 'offerId is required' });
    }

    const reqRecord = await prisma.buyerRequest.findUnique({
      where: { publicToken: token },
    });

    if (!reqRecord) {
      return reply.status(404).send({ error: 'Request not found' });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer || offer.requestId !== reqRecord.id) {
      return reply.status(404).send({ error: 'Offer not found for this request' });
    }

    // Atomic transaction: Select offer, update request status, create deal outcome
    await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: { isBuyerSelected: true },
      }),
      prisma.buyerRequest.update({
        where: { id: reqRecord.id },
        data: { status: RequestStatus.OFFER_SELECTED },
      }),
      prisma.dealOutcome.upsert({
        where: { offerId },
        update: {},
        create: {
          offerId,
          finalAgreedPrice: offer.price,
          commissionAmount: Number(offer.price) * 0.05, // 5% brokerage margin
          status: 'IN_PROGRESS',
        },
      }),
    ]);

    // Notify the winning seller across channels
    try {
      const seller = await prisma.seller.findUnique({ where: { id: offer.sellerId } });
      if (seller) {
        const dealText = `🎯 *DEAL ACCEPTED BY BUYER!*\n\n` +
          `The student #${reqRecord.publicToken} has officially accepted your offer for:\n` +
          `📦 *Device:* ${offer.brand} ${offer.model}\n` +
          `💰 *Agreed Price:* ₦${Number(offer.price).toLocaleString()}\n\n` +
          `🔒 Escrow hold initiated. Campus ops is coordinating the physical inspection and pickup handover!`;

        // 1. Dispatch to Telegram
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (seller.telegramHandle && botToken) {
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: seller.telegramHandle,
              text: dealText,
              parse_mode: 'Markdown',
            }),
          }).catch((err) => console.warn('Deal Telegram notify error:', err));
        }

        // 2. Dispatch to WhatsApp via Evolution API
        const evoUrl = process.env.EVOLUTION_API_URL;
        const evoKey = process.env.EVOLUTION_API_KEY;
        const instance = process.env.EVOLUTION_INSTANCE_NAME || 'handular-bot';
        if (seller.whatsappNumber && !seller.whatsappNumber.startsWith('tg_') && evoUrl && evoKey) {
          const cleanPhone = seller.whatsappNumber.replace(/[^0-9]/g, '');
          fetch(`${evoUrl}/message/sendText/${instance}`, {
            method: 'POST',
            headers: {
              apikey: evoKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              number: cleanPhone,
              text: dealText,
            }),
          }).catch((err) => console.warn('Deal WhatsApp notify error:', err));
        }
      }
    } catch (notifyErr) {
      console.warn('Post-deal seller notify error:', notifyErr);
    }

    return {
      message: 'Deal locked in successfully! Preparing physical inspection and campus handover.',
      deal: {
        publicToken: reqRecord.publicToken,
        offerId: offer.id,
        brand: offer.brand,
        model: offer.model,
        price: offer.price,
        status: 'OFFER_SELECTED',
      },
    };
  });
}
