import { debouncerService } from '../debouncer/debouncer.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TelegramService {
  private botToken: string = process.env.TELEGRAM_BOT_TOKEN || '';
  private pollingActive: boolean = false;
  private lastUpdateId: number = 0;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  /**
   * Starts non-blocking long-polling if a valid Telegram bot token is configured.
   */
  public async startPolling(): Promise<void> {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!this.botToken || this.botToken === 'local-telegram-token') {
      console.log('[TelegramService] Bot token not provided or is placeholder. Polling inactive.');
      return;
    }

    try {
      const meRes = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      const me = (await meRes.json()) as any;
      if (!me.ok) {
        console.warn('[TelegramService] Telegram getMe failed:', me.description || me);
        return;
      }

      console.log(`[TelegramService] Connected successfully as @${me.result.username} (${me.result.first_name})`);
      this.pollingActive = true;
      this.runPollingLoop();
    } catch (err: any) {
      console.error('[TelegramService] Connection failed:', err.message);
    }
  }

  private async runPollingLoop(): Promise<void> {
    while (this.pollingActive) {
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=25`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
              await this.handleUpdate(update);
            }
          }
        } else {
          await new Promise((r) => setTimeout(r, 3000));
        }
      } catch (err) {
        // Network blip retry backoff
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }

  private async handleUpdate(update: any): Promise<void> {
    const message = update?.message;
    if (!message) return;

    const chatId = String(message.chat?.id || '');
    const fromId = message.from?.id ? String(message.from.id) : '';
    const rawUsername = message.from?.username || '';
    const username = rawUsername ? `@${rawUsername}` : `tg_${fromId}`;
    const text = (message.text || message.caption || '').trim();
    const photo = message.photo && message.photo.length > 0 ? message.photo[message.photo.length - 1] : undefined;

    // Handle /start or /help greetings and automatically register/link the seller
    if (text === '/start' || text === '/help') {
      try {
        let seller = await prisma.seller.findFirst({
          where: {
            OR: [
              { telegramHandle: chatId },
              ...(rawUsername ? [
                { telegramHandle: rawUsername },
                { telegramHandle: `@${rawUsername}` },
              ] : []),
              { whatsappNumber: `tg_${chatId}` },
            ],
          },
        });

        const contactName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') || 'Campus Vendor';

        if (!seller) {
          seller = await prisma.seller.create({
            data: {
              businessName: `${contactName}'s Tech Hub`,
              contactName,
              whatsappNumber: `tg_${chatId}`,
              telegramHandle: chatId,
              categories: ['LAPTOPS', 'PHONES', 'ACCESSORIES'],
              verificationStatus: 'VERIFIED',
            },
          });
        } else if (seller.telegramHandle !== chatId) {
          seller = await prisma.seller.update({
            where: { id: seller.id },
            data: { telegramHandle: chatId },
          });
        }

        const welcome = `👋 *Welcome to Handular Campus Marketplace, ${seller.contactName}!* 🎓\n\n` +
          `🎉 *You are officially connected as a Verified Vendor* for:\n` +
          `📦 *${seller.categories.join(', ')}*\n` +
          `🆔 *Vendor Telegram ID:* \`${chatId}\`\n\n` +
          `*How it works:*\n` +
          `1. ⚡ When a student requests a device on campus, our system dispatches a broadcast alert directly to you here.\n` +
          `2. 💬 Reply directly with your asking price (₦), condition, specifications, and photos.\n` +
          `3. 🤖 Our AI compiles your offer and connects you with the student buyer!\n\n` +
          `*Try it now:* Reply with any laptop or phone you currently have in stock!`;

        await this.sendMessage(chatId, welcome, 'Markdown');
      } catch (err: any) {
        console.error('[TelegramService] Error handling /start registration:', err);
      }
      return;
    }

    try {
      // Resolve photo URL via Telegram getFile API if photo is attached
      let photoUrl: string | undefined = undefined;
      if (photo?.file_id) {
        try {
          const fileInfoRes = await fetch(`https://api.telegram.org/bot${this.botToken}/getFile?file_id=${photo.file_id}`);
          if (fileInfoRes.ok) {
            const fileInfo = (await fileInfoRes.json()) as any;
            if (fileInfo.ok && fileInfo.result?.file_path) {
              photoUrl = `https://api.telegram.org/file/bot${this.botToken}/${fileInfo.result.file_path}`;
            }
          }
        } catch (e) {
          console.warn('[TelegramService] Could not resolve photo file path:', e);
        }
      }

      const sellerPhone = message.contact?.phone_number || `tg_${chatId}`;
      const result = await debouncerService.handleInboundMessage({
        sellerPhone,
        telegramHandle: chatId,
        channel: 'TELEGRAM',
        text: text || undefined,
        photoUrl,
      });

      const ack = `✅ *Offer Received!*\n\n` +
        `Queued into Inbound Batch \`#${result.batchId.slice(0, 8)}\`.\n` +
        `⏳ 45s Debouncer active — feel free to send photos or extra specs before AI analysis.\n` +
        `🤖 *AI Spec Extraction & Confidence Check* will run automatically!`;

      await this.sendMessage(chatId, ack, 'Markdown');
    } catch (err: any) {
      console.error('[TelegramService] Error ingesting update into debouncer:', err);
    }
  }

  /**
   * Dispatches an outbound message to a Telegram chat.
   */
  public async sendMessage(chatId: string | number, text: string, parseMode: 'Markdown' | 'HTML' = 'Markdown'): Promise<boolean> {
    if (!this.botToken || this.botToken === 'local-telegram-token') return false;

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode,
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn(`[TelegramService] Dispatch failed to ${chatId}:`, err);
      return false;
    }
  }

  public stopPolling(): void {
    this.pollingActive = false;
  }
}

export const telegramService = new TelegramService();
