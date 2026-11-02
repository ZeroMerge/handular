import { PrismaClient, BatchStatus, ReviewStatus, ChannelType } from '@prisma/client';
import { aiService } from '../ai/ai.service';

const prisma = new PrismaClient();

const DEBOUNCE_WINDOW_MS = 45 * 1000; // 45 seconds silence window

export class DebouncerService {
  /**
   * Ingests a raw inbound message, audio note, or photo from a seller.
   * Resets/extends the 45s silence timer.
   */
  async handleInboundMessage(params: {
    sellerPhone: string;
    channel: ChannelType;
    text?: string;
    audioUrl?: string;
    photoUrl?: string;
    requestId?: string;
  }) {
    // 1. Resolve seller by phone
    let seller = await prisma.seller.findUnique({
      where: { whatsappNumber: params.sellerPhone },
    });

    if (!seller) {
      // Auto-register seller as pending if not found, or use first verified seller
      seller = await prisma.seller.create({
        data: {
          businessName: `Campus Vendor (${params.sellerPhone.slice(-4)})`,
          contactName: 'Vendor',
          whatsappNumber: params.sellerPhone,
          categories: ['LAPTOPS', 'PHONES'],
        },
      });
    }

    // 2. Find an active collecting batch for this seller created in the last 15 minutes
    const now = new Date();
    let batch = await prisma.inboundBatch.findFirst({
      where: {
        sellerId: seller.id,
        status: BatchStatus.COLLECTING,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    const newSilenceExpires = new Date(Date.now() + DEBOUNCE_WINDOW_MS);

    if (batch) {
      // Append to existing batch and extend 45s silence timer
      const rawMessages = params.text ? [...batch.rawMessages, params.text] : batch.rawMessages;
      const rawAudioUrls = params.audioUrl ? [...batch.rawAudioUrls, params.audioUrl] : batch.rawAudioUrls;
      const rawPhotoUrls = params.photoUrl ? [...batch.rawPhotoUrls, params.photoUrl] : batch.rawPhotoUrls;

      batch = await prisma.inboundBatch.update({
        where: { id: batch.id },
        data: {
          rawMessages,
          rawAudioUrls,
          rawPhotoUrls,
          silenceExpires: newSilenceExpires,
          updatedAt: now,
        },
      });
    } else {
      // Create new collecting batch
      batch = await prisma.inboundBatch.create({
        data: {
          sellerId: seller.id,
          channel: params.channel,
          rawMessages: params.text ? [params.text] : [],
          rawAudioUrls: params.audioUrl ? [params.audioUrl] : [],
          rawPhotoUrls: params.photoUrl ? [params.photoUrl] : [],
          status: BatchStatus.COLLECTING,
          silenceExpires: newSilenceExpires,
        },
      });
    }

    // Optionally tie to request if provided or find the latest broadcast for this seller
    let targetRequestId = params.requestId;
    if (!targetRequestId) {
      const recentBroadcast = await prisma.requestBroadcast.findFirst({
        where: { sellerId: seller.id },
        orderBy: { createdAt: 'desc' },
      });
      if (recentBroadcast) {
        targetRequestId = recentBroadcast.requestId;
      }
    }

    return {
      success: true,
      batchId: batch.id,
      silenceExpires: batch.silenceExpires,
      sellerId: seller.id,
      targetRequestId,
      messageCount: batch.rawMessages.length,
      photoCount: batch.rawPhotoUrls.length,
    };
  }

  /**
   * Process a batch whose silence window has passed (or triggered directly)
   */
  async processBatch(batchId: string, forcedRequestId?: string) {
    const batch = await prisma.inboundBatch.findUnique({
      where: { id: batchId },
      include: { seller: true },
    });

    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    // Find target request
    let requestId = forcedRequestId;
    if (!requestId) {
      const recentBroadcast = await prisma.requestBroadcast.findFirst({
        where: { sellerId: batch.sellerId },
        orderBy: { createdAt: 'desc' },
      });
      if (recentBroadcast) {
        requestId = recentBroadcast.requestId;
      } else {
        const latestOpenRequest = await prisma.buyerRequest.findFirst({
          where: { status: { in: ['OPEN', 'BROADCASTED'] } },
          orderBy: { createdAt: 'desc' },
        });
        requestId = latestOpenRequest?.id;
      }
    }

    if (!requestId) {
      throw new Error(`Cannot process batch: No active buyer request found to link with`);
    }

    // Step 1: Transcribe audio if any
    let audioTranscript: string | null = null;
    if (batch.rawAudioUrls.length > 0) {
      await prisma.inboundBatch.update({
        where: { id: batch.id },
        data: { status: BatchStatus.AUDIO_TRANSCRIBING },
      });
      audioTranscript = await aiService.transcribeAudio(batch.rawAudioUrls[0]);
    }

    // Step 2: Vision analysis if photos present
    let visionNotes = '';
    if (batch.rawPhotoUrls.length > 0) {
      await prisma.inboundBatch.update({
        where: { id: batch.id },
        data: { status: BatchStatus.VISION_PROCESSING },
      });
      const visionResult = await aiService.analyzePhotos(batch.rawPhotoUrls);
      visionNotes = `${visionResult.cosmeticAssessment}. OCR: ${visionResult.ocrTexts.join(', ')}`;
    }

    // Step 3: Extract structured JSON via Groq
    await prisma.inboundBatch.update({
      where: { id: batch.id },
      data: { status: BatchStatus.JSON_STRUCTURING },
    });

    const structured = await aiService.extractOfferSpecs({
      rawTexts: batch.rawMessages,
      audioTranscript,
      visionNotes,
    });

    // Cloudinary sample photos if none provided
    const photos =
      batch.rawPhotoUrls.length > 0
        ? batch.rawPhotoUrls
        : [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
          ];

    // Auto-approve if confidence >= 0.85, else flag for staff review
    const isHighConfidence = structured.confidenceScore >= 0.85 && structured.flagReasons.length === 0;
    const reviewStatus = isHighConfidence ? ReviewStatus.AUTO_APPROVED : ReviewStatus.PENDING_REVIEW;

    // Create the structured Offer
    const offer = await prisma.offer.create({
      data: {
        requestId,
        sellerId: batch.sellerId,
        inboundBatchId: batch.id,
        brand: structured.brand,
        model: structured.model,
        specs: {
          cpu: structured.cpu,
          ram: structured.ram,
          storage: structured.storage,
          batteryHealth: structured.batteryHealth,
          screen: structured.screen,
          warranty: structured.warranty,
        },
        price: structured.price,
        conditionGrade: structured.conditionGrade,
        cloudinaryPhotos: photos,
        aiConfidenceScore: structured.confidenceScore,
        reviewStatus,
        isPublishedToBuyer: isHighConfidence,
      },
    });

    // If flagged or low confidence, create a ReviewTask for staff
    if (!isHighConfidence) {
      await prisma.reviewTask.create({
        data: {
          offerId: offer.id,
          flagReason:
            structured.flagReasons.join('; ') ||
            `AI Confidence is ${(structured.confidenceScore * 100).toFixed(0)}% (threshold 85%)`,
        },
      });
    } else {
      // If auto-approved, update request status to OFFERS_READY
      await prisma.buyerRequest.update({
        where: { id: requestId },
        data: { status: 'OFFERS_READY' },
      });
    }

    // Mark batch as completed
    await prisma.inboundBatch.update({
      where: { id: batch.id },
      data: {
        status: BatchStatus.COMPLETED,
        audioTranscript,
        extractedJson: structured as any,
      },
    });

    return {
      success: true,
      batchId: batch.id,
      offerId: offer.id,
      reviewStatus,
      structured,
    };
  }

  /**
   * Sweeps for batches whose 45s silence elapsed and processes them.
   */
  async sweepExpiredBatches() {
    const expiredBatches = await prisma.inboundBatch.findMany({
      where: {
        status: BatchStatus.COLLECTING,
        silenceExpires: { lte: new Date() },
      },
      take: 10,
    });

    const results = [];
    for (const b of expiredBatches) {
      try {
        const res = await this.processBatch(b.id);
        results.push(res);
      } catch (err: any) {
        console.error(`Failed to process batch ${b.id}:`, err);
        await prisma.inboundBatch.update({
          where: { id: b.id },
          data: { status: BatchStatus.FAILED },
        });
      }
    }

    return results;
  }
}

export const debouncerService = new DebouncerService();
