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
});

export async function adminRoutes(fastify: FastifyInstance) {
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
            businessName: true,
            contactName: true,
            whatsappNumber: true,
            rating: true,
            completedDeals: true,
          },
        },
        request: {
          select: {
            publicToken: true,
            buyerName: true,
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

    return { data: pendingOffers, count: pendingOffers.length };
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

    const seller = await prisma.seller.create({
      data: parseResult.data,
    });

    return reply.status(201).send({
      message: 'Verified seller registered successfully',
      data: seller,
    });
  });

  // 7. Get All Sellers (Admin Directory)
  fastify.get('/api/v1/admin/sellers', async () => {
    const sellers = await prisma.seller.findMany({
      orderBy: { rating: 'desc' },
    });
    return { data: sellers, count: sellers.length };
  });

  // 8. Update Seller Status / Categories / Notes
  fastify.patch('/api/v1/admin/sellers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const seller = await prisma.seller.update({
        where: { id },
        data: {
          verificationStatus: body.verificationStatus,
          categories: body.categories,
          notes: body.notes,
        },
      });
      return reply.send({ message: 'Seller updated successfully', data: seller });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // 9. Manual Re-broadcast to Sellers
  fastify.post('/api/v1/admin/requests/:id/broadcast', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await broadcastService.broadcastRequest(id);
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

  // 11. Deal Outcomes & Commission Ledger
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
    return { data: deals, count: deals.length };
  });
}
