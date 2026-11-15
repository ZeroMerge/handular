import { PrismaClient, ChannelType, BroadcastStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class BroadcastService {
  /**
   * Broadcast a buyer request to matching verified campus sellers
   */
  async broadcastRequest(requestId: string): Promise<{
    broadcastedCount: number;
    sellers: { id: string; name: string; channel: string }[];
  }> {
    const request = await prisma.buyerRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    // Find all verified sellers that match this product category
    const matchingSellers = await prisma.seller.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        categories: { has: request.category },
      },
    });

    if (matchingSellers.length === 0) {
      return { broadcastedCount: 0, sellers: [] };
    }

    const specs = (request.targetSpecs as any) || {};
    const broadcastText = `⚡ NEW HANDULAR BUYER REQUEST: #${request.publicToken}
Category: ${request.category}
Target: ${specs.brand || 'Any Brand'} (${specs.useCase || 'General Use'})
Budget: Up to ₦${Number(request.maxBudget).toLocaleString()}
${specs.notes ? `Buyer Notes: "${specs.notes}"\n` : ''}
👉 Reply directly with photos, device specs, and your price to submit an offer!`;

    const broadcastResults = [];

    for (const seller of matchingSellers) {
      let telegramSuccess = false;
      let whatsappSuccess = false;

      // 1. Dispatch to Telegram if telegramHandle is configured
      if (seller.telegramHandle) {
        telegramSuccess = await this.sendTelegramMessage(seller.telegramHandle, broadcastText);
        console.log(`[Broadcast] Telegram dispatch to ${seller.businessName} (${seller.telegramHandle}): ${telegramSuccess ? 'SUCCESS' : 'FAILED'}`);
      }

      // 2. Dispatch to WhatsApp via Evolution API if configured and not dummy phone
      if (seller.whatsappNumber && !seller.whatsappNumber.startsWith('tg_')) {
        whatsappSuccess = await this.sendWhatsAppMessage(seller.whatsappNumber, broadcastText);
        console.log(`[Broadcast] WhatsApp dispatch to ${seller.businessName} (${seller.whatsappNumber}): ${whatsappSuccess ? 'SUCCESS' : 'FAILED'}`);
      }

      const sentSuccess = telegramSuccess || whatsappSuccess;
      const channel = (whatsappSuccess && telegramSuccess) 
        ? ChannelType.WHATSAPP 
        : (whatsappSuccess ? ChannelType.WHATSAPP : ChannelType.TELEGRAM);

      // Record or update audit row in RequestBroadcast
      await prisma.requestBroadcast.upsert({
        where: {
          requestId_sellerId: {
            requestId: request.id,
            sellerId: seller.id,
          },
        },
        create: {
          requestId: request.id,
          sellerId: seller.id,
          channel,
          status: sentSuccess ? BroadcastStatus.SENT : BroadcastStatus.DELIVERED,
          sentAt: new Date(),
        },
        update: {
          status: sentSuccess ? BroadcastStatus.SENT : BroadcastStatus.DELIVERED,
          sentAt: new Date(),
        },
      });

      broadcastResults.push({
        id: seller.id,
        name: seller.businessName,
        channel,
      });
    }

    // Mark request as BROADCASTED
    await prisma.buyerRequest.update({
      where: { id: requestId },
      data: { status: 'BROADCASTED' },
    });

    return {
      broadcastedCount: broadcastResults.length,
      sellers: broadcastResults,
    };
  }

  private async sendWhatsAppMessage(phone: string, text: string): Promise<boolean> {
    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME || 'handular-bot';

    if (!evoUrl || !evoKey) {
      console.warn(`[WhatsApp Broadcast] Evolution API URL or key not configured.`);
      return false;
    }

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const res = await fetch(`${evoUrl}/message/sendText/${instance}`, {
        method: 'POST',
        headers: {
          apikey: evoKey || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cleanPhone,
          text,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn(`WhatsApp dispatch error for ${phone}:`, err);
      return false;
    }
  }

  private async sendTelegramMessage(chatIdOrUsername: string, text: string): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn(`[Telegram Broadcast] Telegram bot token not configured.`);
      return false;
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatIdOrUsername,
          text,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn(`Telegram dispatch error for ${chatIdOrUsername}:`, err);
      return false;
    }
  }
}

export const broadcastService = new BroadcastService();
