import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private initialized = false;
  private ready = false;

  private readonly logger = new Logger(WhatsappService.name);
  private readonly MAX_RETRIES = 3;

  onModuleInit() {
    if (this.initialized) return;

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'auto-whatsapp-bot',
      }),
      webVersionCache: {
        type: 'remote',
        remotePath:
          'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1031992593-alpha.html',
      },
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', async () => {
      this.logger.log('🙏 WhatsApp client ready');
      await new Promise((r) => setTimeout(r, 5000));
      this.ready = true;
      this.logger.log('✅ WhatsApp client fully synced and ready');
    });

    this.client.on('disconnected', (reason) => {
      this.ready = false;
      this.logger.warn(`WhatsApp disconnected: ${reason}`);
    });

    this.client.on('message_ack', (msg, ack) => {
      /*
          ack values:
          0: Error
          1: Sent (One tick)
          2: Delivered (Two ticks)
          3: Read (Blue ticks)
      */
      if (ack === 1) {
        console.log(
          `Confirmed: Message "${msg.body.substring(0, 20)}..." was sent!`,
        );
      }
    });

    this.client.initialize();
    this.initialized = true;
  }

  async sendSingleGroupMessage(
    groupId: string | undefined,
    imageBuffer: Buffer,
    caption: string,
    retryCount = 0,
  ): Promise<void> {
    if (!this.ready) {
      this.logger.log('WhatsApp not ready, skipping send');
      return;
    }

    if (!groupId) {
      throw new Error('WHATSAPP_GROUP_ID is undefined');
    }

    try {
      //const media = MessageMedia.fromFilePath(imagePath);
      const media = new MessageMedia(
        'image/jpeg',
        imageBuffer.toString('base64'),
        'devotional.jpg',
      );

      await this.client.sendMessage(groupId, media, {
        caption: caption,
        sendSeen: false,
      });

      this.logger.log('📤 Devotional sent successfully');
    } catch (e) {
      const isSyncError = e.message?.includes('markedUnread');
      if (isSyncError && retryCount < this.MAX_RETRIES) {
        const nextRetry = retryCount + 1;

        this.logger.error(
          `Sync error. Retry attempt ${nextRetry}/${this.MAX_RETRIES} in 5s...`,
        );

        setTimeout(
          () =>
            this.sendSingleGroupMessage(
              groupId,
              imageBuffer,
              caption,
              nextRetry,
            ),
          5000,
        );
      } else {
        this.logger.error(`WhatsApp Messaging failed: ${e.message}`);
      }
    }
  }
}
