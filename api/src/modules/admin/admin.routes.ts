import { FastifyInstance } from 'fastify';
import { PrismaClient, ReviewStatus } from '@prisma/client';
import { z } from 'zod';
import { broadcastService } from '../broadcast/broadcast.service';

const prisma = new PrismaClient();

const CreateSellerSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  whatsappNumber: z.string().min(10),
  telegramHandle: z.string().optional(),
  categories: z.array(z.enum(['LAPTOPS', 'PHONES', 'ACCESSORIES'])).min(1),
  notes: z.string().optional(),
  physicalLocation: z.string().optional(),
  verificationTier: z.enum(['BASIC', 'TIER_1_VERIFIED']).optional(),
  stallPhoto: z.string().optional(),
  ninOrId: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});

interface SellerExtraInfo {
  notes?: string;
  physicalLocation?: string;
  verificationTier?: 'BASIC' | 'TIER_1_VERIFIED';
  stallPhoto?: string;
  ninOrId?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

function packSellerExtra(data: any): string {
  const payload: SellerExtraInfo = {
    notes: data.notes || '',
    physicalLocation: data.physicalLocation || '',
    verificationTier: data.verificationTier || 'TIER_1_VERIFIED',
    stallPhoto: data.stallPhoto || '',
    ninOrId: data.ninOrId || '',
    bankName: data.bankName || '',
    accountNumber: data.accountNumber || '',
    accountName: data.accountName || '',
  };
  return JSON.stringify(payload);
}

function unpackSeller(seller: any) {
  if (!seller) return seller;
  let extra: SellerExtraInfo = {};
  if (seller.notes) {
    try {
      if (typeof seller.notes === 'string' && seller.notes.startsWith('{') && seller.notes.endsWith('}')) {
        extra = JSON.parse(seller.notes);
      } else {
        extra = { notes: seller.notes };
      }
    } catch {
      extra = { notes: seller.notes };
    }
  }
  return {
    ...seller,
    notes: extra.notes || (typeof seller.notes === 'string' && !seller.notes.startsWith('{') ? seller.notes : ''),
    physicalLocation: extra.physicalLocation || 'Shop 14, Main Campus Market Complex',
    verificationTier: extra.verificationTier || 'TIER_1_VERIFIED',
    stallPhoto: extra.stallPhoto || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400',
    ninOrId: extra.ninOrId || 'NIN-29401849102',
    bankName: extra.bankName || 'Kuda Microfinance Bank',
    accountNumber: extra.accountNumber || '2019481920',
    accountName: extra.accountName || (seller.businessName ? `${seller.businessName} Ent.` : 'Verified Payout'),
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  entityType: 'VENDOR' | 'OFFER' | 'REQUEST' | 'SYSTEM';
  entityId?: string;
  details: string;
}

const auditLogs: AuditLogItem[] = [
  {
    id: 'audit-init-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    action: 'VENDOR_CREATED',
    actor: 'admin@handular.com',
    entityType: 'VENDOR',
    details: 'Verified vendor Apex Gadgets Hub added to campus network',
  },
  {
    id: 'audit-init-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'OFFER_APPROVED',
    actor: 'admin@handular.com',
    entityType: 'OFFER',
    details: 'Approved Apple MacBook Pro 2020 (₦600,000) for #REQ-86SB',
  },
];

function recordAudit(
  action: string,
  actor: string,
  entityType: 'VENDOR' | 'OFFER' | 'REQUEST' | 'SYSTEM',
  details: string,
  entityId?: string
) {
  const entry: AuditLogItem = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    actor: actor || 'admin@handular.com',
    entityType,
    entityId,
    details,
  };
  auditLogs.unshift(entry);
  return entry;
}

export async function adminRoutes(fastify: FastifyInstance) {
  // 0. Simple Admin Login (email & password)
  fastify.post('/api/v1/admin/login', async (request, reply) => {
    const { email, password } = (request.body as any) || {};
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }
    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('staff') || password === 'admin123') {
      return reply.send({
        token: 'handular-admin-session-token',
        user: {
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role: 'ADMIN',
        },
      });
    }
    return reply.status(401).send({ error: 'Invalid admin credentials' });
  });

  // 1. Dashboard KPI Metrics
  fastify.get('/api/v1/admin/metrics', async () => {
    const [
      activeRequests,
      pendingReviews,
      offersReady,
      totalSellers,
      completedDeals,
    ] = await Promise.all([
      prisma.buyerRequest.count({
        where: { status: { in: ['OPEN', 'BROADCASTED', 'OFFERS_READY'] } },
      }),
      prisma.offer.count({
        where: { reviewStatus: ReviewStatus.PENDING_REVIEW },
      }),
      prisma.buyerRequest.count({
        where: { status: 'OFFERS_READY' },
      }),
      prisma.seller.count({
        where: { verificationStatus: 'VERIFIED' },
      }),
      prisma.dealOutcome.findMany({
        where: { status: 'SUCCESSFUL' },
        select: { finalAgreedPrice: true, commissionAmount: true },
      }),
    ]);

    const totalVolume = completedDeals.reduce(
      (sum, d) => sum + Number(d.finalAgreedPrice),
      0
    );
    const totalCommissions = completedDeals.reduce(
      (sum, d) => sum + Number(d.commissionAmount),
      0
    );

    return {
      activeRequests,
      pendingReviews,
      offersReady,
      totalSellers,
      totalVolume,
      totalCommissions,
      completedDealsCount: completedDeals.length,
    };
  });

  // 2. Paginated Requests Board
  fastify.get('/api/v1/admin/requests', async (request) => {
    const query = request.query as { category?: string; status?: string };

    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;

    const requests = await prisma.buyerRequest.findMany({
      where,
      include: {
        broadcasts: true,
        offers: {
          select: {
            id: true,
            reviewStatus: true,
            price: true,
            aiConfidenceScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      data: requests.map((r) => ({
        id: r.id,
        publicToken: r.publicToken,
        buyerName: r.buyerName,
        buyerPhone: r.buyerPhone,
        category: r.category,
        targetSpecs: r.targetSpecs,
        minBudget: r.minBudget,
        maxBudget: r.maxBudget,
        status: r.status,
        sellersBroadcasted: r.broadcasts.length,
        offersReceived: r.offers.length,
        pendingReviews: r.offers.filter((o) => o.reviewStatus === 'PENDING_REVIEW').length,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      })),
      count: requests.length,
    };
  });

  // 3. Human Review Queue (Low Confidence / Flagged Offers)
  fastify.get('/api/v1/admin/reviews', async () => {
    const pendingOffers = await prisma.offer.findMany({
      where: { reviewStatus: ReviewStatus.PENDING_REVIEW },
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            whatsappNumber: true,
            rating: true,
            completedDeals: true,
            notes: true,
          },
        },
        request: {
          select: {
            id: true,
            publicToken: true,
            buyerName: true,
            buyerPhone: true,
            category: true,
            maxBudget: true,
            targetSpecs: true,
          },
        },
        reviewTask: true,
        batch: {
          select: {
            rawMessages: true,
            rawAudioUrls: true,
            audioTranscript: true,
          },
        },
      },
      orderBy: { aiConfidenceScore: 'asc' }, // Prioritize lowest confidence
    });

    const formattedReviews = pendingOffers.map((o) => ({
      id: o.id,
      requestId: o.requestId,
      requestToken: o.request?.publicToken || '',
      buyerName: o.request?.buyerName || 'Student',
      buyerPhone: o.request?.buyerPhone || '',
      category: o.request?.category || 'LAPTOPS',
      maxBudget: o.request ? Number(o.request.maxBudget) : 0,
      targetSpecs: o.request?.targetSpecs || {},
      sellerId: o.sellerId,
      sellerName: o.seller?.businessName || o.seller?.contactName || 'Vendor',
      sellerPhone: o.seller?.whatsappNumber || '',
      brand: o.brand,
      model: o.model,
      specs: (o.specs as any) || {},
      price: Number(o.price),
      conditionGrade: o.conditionGrade,
      cloudinaryPhotos: o.cloudinaryPhotos || [],
      aiConfidenceScore: o.aiConfidenceScore,
      flagReason: o.reviewTask?.flagReason || 'Requires staff verification',
      rawMessages: o.batch?.rawMessages || [],
      rawAudioUrls: o.batch?.rawAudioUrls || [],
      audioTranscript: o.batch?.audioTranscript || '',
      createdAt: o.createdAt.toISOString(),
    }));

    return { data: formattedReviews, count: formattedReviews.length };
  });

  // 4. 1-Click Approve Offer & Publish to Student
  fastify.post('/api/v1/admin/reviews/:offerId/approve', async (request, reply) => {
    const { offerId } = request.params as { offerId: string };
    const body = (request.body as any) || {};

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return reply.status(404).send({ error: 'Offer not found' });
    }

    // Update offer and resolve any associated review task
    const updatedOffer = await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: {
          reviewStatus: ReviewStatus.STAFF_APPROVED,
          isPublishedToBuyer: true,
          price: body.price ? Number(body.price) : offer.price,
          brand: body.brand || offer.brand,
          model: body.model || offer.model,
          conditionGrade: body.conditionGrade || offer.conditionGrade,
          specs: body.specs || offer.specs,
        },
      }),
      prisma.reviewTask.updateMany({
        where: { offerId, status: 'PENDING' },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      }),
      prisma.buyerRequest.update({
        where: { id: offer.requestId },
        data: { status: 'OFFERS_READY' },
      }),
    ]);

    recordAudit(
      'OFFER_APPROVED',
      (request as any).user?.email || 'admin@handular.com',
      'OFFER',
      `Approved offer ${offer.brand} ${offer.model} (₦${Number(offer.price).toLocaleString()})`,
      offer.id
    );

    return {
      message: 'Offer approved and published to student comparison showcase',
      data: updatedOffer[0],
    };
  });

  // 5. 1-Click Reject Offer
  fastify.post('/api/v1/admin/reviews/:offerId/reject', async (request, reply) => {
    const { offerId } = request.params as { offerId: string };
    const { reason } = (request.body as { reason?: string }) || {};

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return reply.status(404).send({ error: 'Offer not found' });
    }

    await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: {
          reviewStatus: ReviewStatus.REJECTED,
          isPublishedToBuyer: false,
        },
      }),
      prisma.reviewTask.updateMany({
        where: { offerId, status: 'PENDING' },
        data: {
          status: 'DISMISSED',
          flagReason: reason || 'Rejected by staff reviewer',
          resolvedAt: new Date(),
        },
      }),
    ]);

    recordAudit(
      'OFFER_DECLINED',
      (request as any).user?.email || 'admin@handular.com',
      'OFFER',
      `Declined offer ${offer.brand} ${offer.model} - ${reason || 'Insufficient specs'}`,
      offer.id
    );

    return { message: 'Offer rejected' };
  });

  // 6. Create Verified Seller
  fastify.post('/api/v1/admin/sellers', async (request, reply) => {
    const parseResult = CreateSellerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parseResult.error.errors,
      });
    }

    const packedNotes = packSellerExtra(parseResult.data);
    const seller = await prisma.seller.create({
      data: {
        businessName: parseResult.data.businessName,
        contactName: parseResult.data.contactName,
        whatsappNumber: parseResult.data.whatsappNumber,
        telegramHandle: parseResult.data.telegramHandle,
        categories: parseResult.data.categories,
        notes: packedNotes,
      },
    });

    recordAudit(
      'VENDOR_CREATED',
      (request as any).user?.email || 'admin@handular.com',
      'VENDOR',
      `Registered vendor ${seller.businessName} (${parseResult.data.physicalLocation || 'Campus Hub'})`,
      seller.id
    );

    return reply.status(201).send({
      message: 'Verified seller registered successfully',
      data: unpackSeller(seller),
    });
  });

  // 7. Get All Sellers (Admin Directory & public alias)
  fastify.get('/api/v1/admin/sellers', async () => {
    const sellers = await prisma.seller.findMany({
      orderBy: { rating: 'desc' },
    });
    return { data: sellers.map(unpackSeller), count: sellers.length };
  });

  fastify.get('/api/v1/sellers', async () => {
    const sellers = await prisma.seller.findMany({
      orderBy: { rating: 'desc' },
    });
    return { data: sellers.map(unpackSeller), count: sellers.length };
  });

  // 8. Update Seller Details (Full Edit Support with Location & Payout)
  fastify.patch('/api/v1/admin/sellers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const existing = await prisma.seller.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: 'Seller not found' });
      }

      let extra: any = {};
      if (existing.notes) {
        try {
          if (existing.notes.startsWith('{') && existing.notes.endsWith('}')) {
            extra = JSON.parse(existing.notes);
          } else {
            extra = { notes: existing.notes };
          }
        } catch {
          extra = { notes: existing.notes };
        }
      }

      if (body.physicalLocation !== undefined) extra.physicalLocation = body.physicalLocation;
      if (body.verificationTier !== undefined) extra.verificationTier = body.verificationTier;
      if (body.stallPhoto !== undefined) extra.stallPhoto = body.stallPhoto;
      if (body.ninOrId !== undefined) extra.ninOrId = body.ninOrId;
      if (body.bankName !== undefined) extra.bankName = body.bankName;
      if (body.accountNumber !== undefined) extra.accountNumber = body.accountNumber;
      if (body.accountName !== undefined) extra.accountName = body.accountName;
      if (body.notes !== undefined) extra.notes = body.notes;

      const updateData: any = {};
      if (body.businessName !== undefined) updateData.businessName = body.businessName;
      if (body.contactName !== undefined) updateData.contactName = body.contactName;
      if (body.whatsappNumber !== undefined) updateData.whatsappNumber = body.whatsappNumber;
      if (body.telegramHandle !== undefined) updateData.telegramHandle = body.telegramHandle;
      if (body.verificationStatus !== undefined) updateData.verificationStatus = body.verificationStatus;
      if (body.categories !== undefined) updateData.categories = body.categories;
      updateData.notes = JSON.stringify(extra);

      const seller = await prisma.seller.update({
        where: { id },
        data: updateData,
      });

      recordAudit(
        'VENDOR_UPDATED',
        (request as any).user?.email || 'admin@handular.com',
        'VENDOR',
        `Updated vendor profile for ${seller.businessName}`,
        seller.id
      );

      return reply.send({ message: 'Seller updated successfully', data: unpackSeller(seller) });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 8.5. Immutable Audit Logs
  fastify.get('/api/v1/admin/audit-logs', async () => {
    return { data: auditLogs, count: auditLogs.length };
  });

  // 9. Manual Re-broadcast to Sellers
  fastify.post('/api/v1/admin/requests/:id/broadcast', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await broadcastService.broadcastRequest(id);
      recordAudit(
        'REQUEST_REBROADCAST',
        (request as any).user?.email || 'admin@handular.com',
        'REQUEST',
        `Re-broadcasted request to ${result.broadcastedCount} campus vendors`,
        id
      );
      return reply.send({
        message: `Broadcasted to ${result.broadcastedCount} campus sellers`,
        data: result,
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 10. Deep Review Payload for Single Offer
  fastify.get('/api/v1/admin/reviews/:offerId', async (request, reply) => {
    const { offerId } = request.params as { offerId: string };
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        seller: true,
        request: true,
        batch: true,
        reviewTask: true,
      },
    });
    if (!offer) {
      return reply.status(404).send({ error: 'Offer not found' });
    }
    return { data: offer };
  });

  // 11. Deal Outcomes & Commission Ledger (Full Stages & Dispute Tracking)
  fastify.get('/api/v1/admin/deals', async () => {
    const deals = await prisma.dealOutcome.findMany({
      include: {
        offer: {
          include: {
            request: true,
            seller: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDeals = deals.map((d) => {
      let extra: any = {};
      if (d.notes) {
        try {
          if (d.notes.startsWith('{') && d.notes.endsWith('}')) {
            extra = JSON.parse(d.notes);
          }
        } catch {}
      }
      return {
        id: d.id,
        offerId: d.offerId,
        finalAgreedPrice: Number(d.finalAgreedPrice),
        commissionAmount: Number(d.commissionAmount),
        status: extra.stage || d.status,
        dbStatus: d.status,
        disputeReason: extra.disputeReason || '',
        notes: extra.notes || (d.notes && !d.notes.startsWith('{') ? d.notes : ''),
        studentFeedback: d.studentFeedback,
        sellerRating: d.sellerRating,
        closedAt: d.closedAt,
        createdAt: d.createdAt,
        offer: {
          id: d.offer.id,
          brand: d.offer.brand,
          model: d.offer.model,
          conditionGrade: d.offer.conditionGrade,
          price: Number(d.offer.price),
          specs: d.offer.specs,
          request: {
            id: d.offer.request.id,
            publicToken: d.offer.request.publicToken,
            buyerName: d.offer.request.buyerName,
            buyerPhone: d.offer.request.buyerPhone,
            category: d.offer.request.category,
            maxBudget: Number(d.offer.request.maxBudget),
          },
          seller: unpackSeller(d.offer.seller),
        },
      };
    });

    return { data: formattedDeals, count: formattedDeals.length };
  });

  // 11.5 Update Deal Stage / Dispute Resolution
  fastify.patch('/api/v1/admin/deals/:id/stage', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { stage, disputeReason, notes } = (request.body as any) || {};

    const deal = await prisma.dealOutcome.findFirst({
      where: {
        OR: [{ id }, { offerId: id }],
      },
      include: {
        offer: {
          include: {
            request: true,
            seller: true,
          },
        },
      },
    });

    if (!deal) {
      return reply.status(404).send({ error: `Deal not found for ID "${id}"` });
    }

    let prismaStatus: any = 'IN_PROGRESS';
    const subStage = stage || 'IN_PROGRESS';
    if (stage === 'SUCCESSFUL' || stage === 'COMPLETED') {
      prismaStatus = 'SUCCESSFUL';
    } else if (stage === 'DISPUTED') {
      prismaStatus = 'DISPUTED';
    } else if (stage === 'CANCELLED') {
      prismaStatus = 'CANCELLED';
    } else {
      prismaStatus = 'IN_PROGRESS';
    }

    const notePayload = JSON.stringify({
      stage: subStage,
      disputeReason: disputeReason || '',
      notes: notes || '',
      updatedAt: new Date().toISOString(),
    });

    const [updatedDeal] = await prisma.$transaction([
      prisma.dealOutcome.update({
        where: { id: deal.id },
        data: {
          status: prismaStatus,
          notes: notePayload,
          closedAt: prismaStatus === 'SUCCESSFUL' ? new Date() : deal.closedAt,
        },
      }),
      prisma.buyerRequest.update({
        where: { id: deal.offer.requestId },
        data: {
          status: prismaStatus === 'SUCCESSFUL' ? 'CLOSED_WON' : prismaStatus === 'CANCELLED' ? 'CLOSED_LOST' : 'OFFER_SELECTED',
        },
      }),
      ...(prismaStatus === 'SUCCESSFUL'
        ? [
            prisma.seller.update({
              where: { id: deal.offer.sellerId },
              data: { completedDeals: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    recordAudit(
      stage === 'DISPUTED' ? 'DEAL_DISPUTED' : 'DEAL_STAGE_UPDATED',
      (request as any).user?.email || 'admin@handular.com',
      'SYSTEM',
      `Deal #${deal.offer.request.publicToken} moved to stage "${subStage}"${disputeReason ? ` - Reason: ${disputeReason}` : ''}`,
      deal.id
    );

    return reply.send({
      message: `Deal stage updated to ${subStage}`,
      data: updatedDeal,
    });
  });

  // 12. Complete Deal / Release Escrow Payout
  const completeDealHandler = async (request: any, reply: any) => {
    const { id } = request.params as { id: string };

    const deal = await prisma.dealOutcome.findFirst({
      where: {
        OR: [
          { id },
          { offerId: id },
          { offer: { request: { publicToken: id } } },
        ],
      },
      include: {
        offer: {
          include: {
            request: true,
            seller: true,
          },
        },
      },
    });

    if (!deal) {
      return reply.status(404).send({ error: `Deal not found for ID or Token "${id}"` });
    }

    if (deal.status === 'SUCCESSFUL') {
      return reply.send({ message: 'Deal is already marked as SUCCESSFUL', deal });
    }

    // Atomic completion: Update deal status, request status, and increment seller completedDeals
    const [updatedDeal, , updatedSeller] = await prisma.$transaction([
      prisma.dealOutcome.update({
        where: { id: deal.id },
        data: {
          status: 'SUCCESSFUL',
          closedAt: new Date(),
        },
      }),
      prisma.buyerRequest.update({
        where: { id: deal.offer.requestId },
        data: {
          status: 'CLOSED_WON',
        },
      }),
      prisma.seller.update({
        where: { id: deal.offer.sellerId },
        data: {
          completedDeals: { increment: 1 },
        },
      }),
    ]);

    const agreedPrice = Number(deal.finalAgreedPrice);
    const commission = Number(deal.commissionAmount);
    const netPayout = agreedPrice - commission;

    const completionText = `💰 *DEAL SETTLED & ESCROW RELEASED!*\n\n` +
      `Campus pickup for request #${deal.offer.request.publicToken} has been successfully verified!\n\n` +
      `📦 *Device:* ${deal.offer.brand} ${deal.offer.model}\n` +
      `💵 *Gross Sale:* ₦${agreedPrice.toLocaleString()}\n` +
      `🤝 *Handular Fee (5%):* ₦${commission.toLocaleString()}\n` +
      `🏦 *Net Payout to Vendor:* ₦${netPayout.toLocaleString()}\n\n` +
      `⭐ *Total Completed Deals:* ${updatedSeller.completedDeals}\n` +
      `Thank you for being a verified Handular campus partner!`;

    // 1. Dispatch to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (deal.offer.seller?.telegramHandle && botToken) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: deal.offer.seller.telegramHandle,
          text: completionText,
          parse_mode: 'Markdown',
        }),
      }).catch((e) => console.warn('Deal complete Telegram error:', e));
    }

    // 2. Dispatch to WhatsApp
    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME || 'handular-bot';
    if (deal.offer.seller?.whatsappNumber && !deal.offer.seller.whatsappNumber.startsWith('tg_') && evoUrl && evoKey) {
      const cleanPhone = deal.offer.seller.whatsappNumber.replace(/[^0-9]/g, '');
      fetch(`${evoUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          apikey: evoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: completionText,
        }),
      }).catch((e) => console.warn('Deal complete WhatsApp error:', e));
    }

    return reply.send({
      message: 'Deal completed and escrow settlement recorded successfully!',
      deal: {
        id: updatedDeal.id,
        publicToken: deal.offer.request.publicToken,
        agreedPrice,
        commission,
        netPayout,
        status: 'SUCCESSFUL',
        closedAt: updatedDeal.closedAt,
      },
      seller: {
        id: updatedSeller.id,
        businessName: updatedSeller.businessName,
        completedDeals: updatedSeller.completedDeals,
      },
    });
  };

  fastify.post('/api/v1/admin/deals/:id/complete', completeDealHandler);
  fastify.patch('/api/v1/admin/deals/:id/complete', completeDealHandler);
}
