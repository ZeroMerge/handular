import { PrismaClient, BatchStatus, ReviewStatus, ChannelType } from '@prisma/client';
import { aiService } from '../ai/ai.service';
import { mediaService } from '../media/media.service';
import { sharedStore, InboundBatchRecord } from '../common/store';

const prisma = new PrismaClient();

const DEBOUNCE_WINDOW_MS = 15 * 1000; // 15 seconds silence window for responsive campus testing

export class DebouncerService {
  /**
   * Fallback heuristic parser if AI API is unavailable or rate limited
   */
  private parseTextHeuristics(texts: string[]) {
    const full = texts.join(' ');
    
    // Price extraction: e.g. 550k, 550,000, ₦600000, 450000
    let price = 0;
    const priceMatch = full.match(/(?:₦|NGN|N)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{2,3}k|[0-9]{5,7})/i);
    if (priceMatch) {
      let raw = priceMatch[1].toLowerCase().replace(/,/g, '');
      if (raw.endsWith('k')) {
        price = parseFloat(raw.replace('k', '')) * 1000;
      } else {
        price = parseFloat(raw);
      }
    }

    // Brand extraction
    const brands = ['Apple', 'HP', 'Dell', 'Lenovo', 'Samsung', 'Asus', 'Acer', 'Google', 'Microsoft'];
    let brand = 'Device';
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(full)) {
        brand = b;
        break;
      }
    }

    // Model extraction
    let model = 'Laptop';
    if (/macbook\s*(pro|air)?/i.test(full)) {
      const m = full.match(/macbook\s*(pro|air)?\s*(m1|m2|m3|[0-9]{4})?/i);
      model = m ? m[0] : 'MacBook Pro';
    } else if (/iphone\s*([0-9]{1,2}(?:\s*pro(?:\s*max)?)?)/i.test(full)) {
      const m = full.match(/iphone\s*([0-9]{1,2}(?:\s*pro(?:\s*max)?)?)/i);
      model = m ? m[0] : 'iPhone';
    } else if (/galaxy\s*s[0-9]{2}(?:\s*ultra)?/i.test(full)) {
      const m = full.match(/galaxy\s*s[0-9]{2}(?:\s*ultra)?/i);
      model = m ? m[0] : 'Galaxy S-Series';
    } else if (/elitebook|thinkpad|latitude|spectre|xps|envy/i.test(full)) {
      const m = full.match(/\b(elitebook|thinkpad|latitude|spectre|xps|envy)(?:\s*[0-9a-z]+)?/i);
      model = m ? m[0] : 'Ultrabook';
    }

    // RAM extraction
    const ramMatch = full.match(/([0-9]{1,2})\s*gb\s*ram/i) || full.match(/\b([0-9]{1,2})\s*gb\b/i);
    const ram = ramMatch ? `${ramMatch[1]}GB` : '16GB';

    // Storage extraction
    const storageMatch = full.match(/([0-9]{3})\s*gb\s*(?:ssd|storage)?/i) || full.match(/([1-2])\s*tb/i);
    const storage = storageMatch ? (storageMatch[0].toUpperCase()) : '512GB SSD';

    // Battery extraction
    const batteryMatch = full.match(/([0-9]{2,3})\s*%/);
    const batteryHealth = batteryMatch ? `${batteryMatch[1]}%` : '88%';

    // Condition
    const conditionGrade = /brand\s*new/i.test(full)
      ? 'Brand New'
      : /grade\s*a|clean|mint|uk\s*used/i.test(full)
      ? 'Grade A UK Used'
      : 'Grade B';

    return {
      brand,
      model,
      price: price || 350000,
      conditionGrade,
      ram,
      storage,
      batteryHealth,
      cpu: full.includes('M1') ? 'Apple M1' : full.includes('i7') ? 'Intel Core i7' : 'Intel Core i5',
      screen: 'Retina / FHD Display',
      warranty: '30-day campus operational warranty',
      confidenceScore: 0.82,
      flagReasons: ['Automated heuristic extraction from vendor chat'],
    };
  }

  /**
   * Ingests a raw inbound message, audio note, or photo from a seller.
   * Resets/extends the silence timer.
   */
  async handleInboundMessage(params: {
    sellerPhone: string;
    channel: ChannelType | 'TELEGRAM' | 'WHATSAPP';
    telegramHandle?: string;
    text?: string;
    audioUrl?: string;
    photoUrl?: string;
    requestId?: string;
  }) {
    // 1. Resolve seller from DB or memory store
    let seller: any = null;
    try {
      seller = await prisma.seller.findFirst({
        where: {
          OR: [
            { whatsappNumber: params.sellerPhone },
            ...(params.telegramHandle ? [
              { telegramHandle: params.telegramHandle },
              { telegramHandle: `@${params.telegramHandle.replace('@', '')}` },
            ] : []),
          ],
        },
      });
    } catch {}

    if (!seller) {
      seller = sharedStore.getOrCreateSeller({
        phone: params.sellerPhone,
        telegramHandle: params.telegramHandle,
      });
    }

    const newSilenceExpires = new Date(Date.now() + DEBOUNCE_WINDOW_MS);

    // 2. Find or create in-memory batch
    let memBatch = sharedStore.inboundBatches.find(
      (b) => b.sellerId === seller.id && b.status === 'COLLECTING'
    );

    if (memBatch) {
      if (params.text) memBatch.rawMessages.push(params.text);
      if (params.photoUrl) memBatch.rawPhotoUrls.push(params.photoUrl);
      if (params.audioUrl) memBatch.rawAudioUrls.push(params.audioUrl);
      memBatch.silenceExpires = newSilenceExpires;
    } else {
      memBatch = {
        id: `batch-${Date.now()}`,
        sellerId: seller.id,
        channel: (params.channel as any) || 'TELEGRAM',
        rawMessages: params.text ? [params.text] : [],
        rawPhotoUrls: params.photoUrl ? [params.photoUrl] : [],
        rawAudioUrls: params.audioUrl ? [params.audioUrl] : [],
        targetRequestId: params.requestId,
        silenceExpires: newSilenceExpires,
        status: 'COLLECTING',
        createdAt: new Date(),
      };
      sharedStore.inboundBatches.push(memBatch);
    }

    // 3. Try to record in DB if connected
    try {
      let dbBatch = await prisma.inboundBatch.findFirst({
        where: {
          sellerId: seller.id,
          status: BatchStatus.COLLECTING,
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbBatch) {
        await prisma.inboundBatch.update({
          where: { id: dbBatch.id },
          data: {
            rawMessages: params.text ? [...dbBatch.rawMessages, params.text] : dbBatch.rawMessages,
            rawPhotoUrls: params.photoUrl ? [...dbBatch.rawPhotoUrls, params.photoUrl] : dbBatch.rawPhotoUrls,
            rawAudioUrls: params.audioUrl ? [...dbBatch.rawAudioUrls, params.audioUrl] : dbBatch.rawAudioUrls,
            silenceExpires: newSilenceExpires,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.inboundBatch.create({
          data: {
            id: memBatch.id,
            sellerId: seller.id,
            channel: params.channel as ChannelType,
            rawMessages: params.text ? [params.text] : [],
            rawAudioUrls: params.audioUrl ? [params.audioUrl] : [],
            rawPhotoUrls: params.photoUrl ? [params.photoUrl] : [],
            status: BatchStatus.COLLECTING,
            silenceExpires: newSilenceExpires,
          },
        });
      }
    } catch {}

    // 4. Trigger instant background processing after a brief 3-second debounce
    // so user gets near real-time feedback without waiting 45s
    setTimeout(async () => {
      try {
        await this.processBatch(memBatch!.id, params.requestId);
      } catch (err) {
        console.warn('[Debouncer] Auto-process error:', err);
      }
    }, 4000);

    return {
      success: true,
      batchId: memBatch.id,
      silenceExpires: memBatch.silenceExpires,
      sellerId: seller.id,
      targetRequestId: memBatch.targetRequestId,
      messageCount: memBatch.rawMessages.length,
      photoCount: memBatch.rawPhotoUrls.length,
    };
  }

  /**
   * Process a batch whose silence window has passed (or triggered directly)
   */
  async processBatch(batchId: string, forcedRequestId?: string) {
    const memBatch = sharedStore.inboundBatches.find((b) => b.id === batchId);
    if (!memBatch || memBatch.status === 'PROCESSED') {
      return { success: false, reason: 'Batch already processed or not found' };
    }

    memBatch.status = 'PROCESSED';

    const sellerRecord = sharedStore.sellers.find((s) => s.id === memBatch.sellerId) || {
      id: memBatch.sellerId,
      businessName: 'Campus Vendor',
      contactName: 'Vendor',
      whatsappNumber: '2348012345678',
      telegramHandle: 'apex_gadgets_campus',
    };

    // Find target request from store or DB
    let targetRequest = sharedStore.requests.find((r) => r.id === (forcedRequestId || memBatch.targetRequestId));
    if (!targetRequest) {
      targetRequest = sharedStore.requests[0];
    }

    // Step 1: Extract structured JSON using AI or heuristic fallback
    let structured: any = null;
    try {
      structured = await aiService.extractOfferSpecs({
        rawTexts: memBatch.rawMessages,
        audioTranscript: null,
        visionNotes: '',
      });
    } catch (e) {
      console.warn('[Debouncer] AI extraction failed, falling back to heuristics:', e);
    }

    if (!structured || !structured.price || structured.price <= 0) {
      structured = this.parseTextHeuristics(memBatch.rawMessages);
    }

    // Format photos
    const rawPhotos = memBatch.rawPhotoUrls.length > 0
      ? memBatch.rawPhotoUrls
      : [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
        ];
    const photos = rawPhotos.map((p) => mediaService.formatAvifUrl(p));

    const isHighConfidence = (structured.confidenceScore || 0) >= 0.85 && structured.price > 0;
    const reviewStatus = isHighConfidence ? ReviewStatus.AUTO_APPROVED : ReviewStatus.PENDING_REVIEW;

    const offerId = `rev-${Date.now()}`;

    // Step 2: Push offer to sharedStore.reviews (so it surfaces in Admin Review instantly!)
    sharedStore.addReview({
      id: offerId,
      requestId: targetRequest ? targetRequest.id : 'req-demo-1',
      requestToken: targetRequest ? targetRequest.publicToken : 'REQ-86SB',
      buyerName: targetRequest ? targetRequest.buyerName : 'Student',
      buyerPhone: targetRequest ? targetRequest.buyerPhone : '08123456789',
      category: targetRequest ? targetRequest.category : 'LAPTOPS',
      maxBudget: targetRequest ? targetRequest.maxBudget : 650000,
      targetSpecs: targetRequest ? targetRequest.targetSpecs : {},
      sellerId: sellerRecord.id,
      sellerName: sellerRecord.businessName || sellerRecord.contactName,
      sellerPhone: sellerRecord.whatsappNumber,
      brand: structured.brand || 'Device',
      model: structured.model || 'Model',
      specs: {
        cpu: structured.cpu,
        ram: structured.ram,
        storage: structured.storage,
        batteryHealth: structured.batteryHealth,
        screen: structured.screen,
        warranty: structured.warranty,
      },
      price: Number(structured.price) || 350000,
      conditionGrade: structured.conditionGrade || 'Grade A UK Used',
      cloudinaryPhotos: photos,
      aiConfidenceScore: structured.confidenceScore || 0.8,
      flagReason: isHighConfidence
        ? 'High confidence matching student budget'
        : 'Requires staff verification and condition confirmation',
      rawMessages: memBatch.rawMessages,
      rawAudioUrls: memBatch.rawAudioUrls,
      createdAt: new Date().toISOString(),
    });

    // Step 3: Attempt database sync if DB is up
    try {
      await prisma.offer.create({
        data: {
          id: offerId,
          requestId: targetRequest.id,
          sellerId: sellerRecord.id,
          inboundBatchId: memBatch.id,
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
          aiConfidenceScore: structured.confidenceScore || 0.8,
          reviewStatus,
          isPublishedToBuyer: isHighConfidence,
        },
      });

      if (!isHighConfidence) {
        await prisma.reviewTask.create({
          data: {
            offerId,
            flagReason: 'Staff verification required',
          },
        });
      }
    } catch {}

    // Step 4: Outbound real-time confirmation to seller via Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const notifyText = isHighConfidence
      ? `🎉 *Offer Approved & Published to Student!*\n\n` +
        `📦 *Item:* ${structured.brand} ${structured.model}\n` +
        `💰 *Price:* ₦${Number(structured.price).toLocaleString()}\n` +
        `🏷️ *Grade:* ${structured.conditionGrade}\n\n` +
        `The student has been notified and can compare your offer on Handular.`
      : `📋 *Offer Received & Sent to Admin Review!*\n\n` +
        `📦 *Item:* ${structured.brand} ${structured.model}\n` +
        `💰 *Price:* ₦${Number(structured.price).toLocaleString()}\n` +
        `🏷️ *Grade:* ${structured.conditionGrade}\n\n` +
        `Campus desk staff is verifying the specs and will publish it shortly!`;

    if (sellerRecord?.telegramHandle && botToken) {
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sellerRecord.telegramHandle,
            text: notifyText,
            parse_mode: 'Markdown',
          }),
        });
      } catch (e) {
        console.warn('[Debouncer] Telegram notification failed:', e);
      }
    }

    return {
      success: true,
      batchId: memBatch.id,
      offerId,
      reviewStatus,
      structured,
    };
  }

  /**
   * Sweeps for batches whose silence elapsed and processes them.
   */
  async sweepExpiredBatches() {
    const now = new Date();
    const expiredMemBatches = sharedStore.inboundBatches.filter(
      (b) => b.status === 'COLLECTING' && b.silenceExpires <= now
    );

    const results = [];
    for (const b of expiredMemBatches) {
      try {
        const res = await this.processBatch(b.id);
        results.push(res);
      } catch (e) {
        console.warn(`[Debouncer] Failed to process mem batch ${b.id}:`, e);
      }
    }

    // Also sweep DB if available
    try {
      const expiredBatches = await prisma.inboundBatch.findMany({
        where: {
          status: BatchStatus.COLLECTING,
          silenceExpires: { lte: now },
        },
        take: 10,
      });

      for (const b of expiredBatches) {
        try {
          const res = await this.processBatch(b.id);
          results.push(res);
        } catch (err: any) {
          await prisma.inboundBatch.update({
            where: { id: b.id },
            data: { status: BatchStatus.FAILED },
          }).catch(() => {});
        }
      }
    } catch {}

    return results;
  }
}

export const debouncerService = new DebouncerService();
