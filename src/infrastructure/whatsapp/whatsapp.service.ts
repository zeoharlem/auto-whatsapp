import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private initialized = false;
  private ready = false;

  onModuleInit() {
    if (this.initialized) return;

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'auto-whatsapp-bot',
      }),
    });

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.ready = true;
      console.log('🙏 WhatsApp client ready');
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
    imagePath: string,
    caption: string,
  ): Promise<void> {
    if (!this.ready) {
      console.log('WhatsApp not ready, skipping send');
      return;
    }
    if (!groupId) {
      throw new Error('WHATSAPP_GROUP_ID is undefined');
    }
    const media = MessageMedia.fromFilePath(imagePath);
    await this.client.sendMessage(groupId, media, { caption });
  }
}
