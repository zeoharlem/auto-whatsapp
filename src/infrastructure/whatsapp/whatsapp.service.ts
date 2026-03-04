import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit, OnApplicationShutdown {
  private client: Client;
  private initialized = false;
  private ready = false;

  private readonly logger = new Logger(WhatsappService.name);
  private readonly MAX_RETRIES = 3;

  async onModuleInit() {
    await this.initializeClient();
  }

  private async initializeClient() {
    if (this.initialized) return;

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'auto-whatsapp-bot',
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-zygote',
          '--single-process',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-features=CertificateTransparencyComponentUpdater',
        ],
      },
      webVersionCache: {
        type: 'local',
        path: './.wwebjs_cache',
      },
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', async () => {
      this.logger.log('🙏 WhatsApp client ready');
      this.ready = true;
    });

    /*this.client.on('disconnected', (reason) => {
      this.ready = false;
      this.logger.warn(`WhatsApp disconnected: ${reason}`);
    });*/

    this.client.on('disconnected', async (reason) => {
      this.ready = false;
      this.logger.warn(`WhatsApp disconnected: ${reason}`);

      await this.client.destroy();
      this.initialized = false;

      setTimeout(() => this.initializeClient(), 5000);
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

    await this.client.initialize();
    this.initialized = true;
  }

  async ensureReady(): Promise<void> {
    if (!this.initialized || !this.client) {
      await this.initializeClient();
    }

    if (this.ready) return;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WhatsApp client failed to become ready'));
      }, 30_000); // wait up to 30 seconds

      this.client.once('ready', () => {
        clearTimeout(timeout);
        this.ready = true;
        resolve();
      });

      this.client.once('auth_failure', (msg) => {
        clearTimeout(timeout);
        reject(new Error(`Auth failure: ${msg}`));
      });
    });
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

  async destroyClient(): Promise<void> {
    if (!this.client) return;

    try {
      this.logger.log('Destroying WhatsApp client...');

      await this.client.destroy();

      this.ready = false;
      this.initialized = false;
      this.client = null;

      this.logger.log('WhatsApp client destroyed successfully');
    } catch (err) {
      this.logger.error('Error destroying WhatsApp client', err);
    }
  }

  //Added to manage graceful exception/crash
  async onApplicationShutdown(signal?: string) {
    console.log('Shutting down WhatsApp client, signal:', signal);
    if (this.client) {
      try {
        await this.client.destroy(); // closes puppeteer properly
        console.log('WhatsApp client closed gracefully');
      } catch (err) {
        console.error('Error closing WhatsApp client:', err);
      }
    }

    // Exit with 0 to avoid "crash" in logs
    if (signal) process.exit(0);
  }
}
