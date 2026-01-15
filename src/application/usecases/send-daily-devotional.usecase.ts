import { DevotionalRepository } from '../../domain/devotional.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WhatsappService } from '../../infrastructure/whatsapp/whatsapp.service';
import { ExtractDevotionalTextUseCase } from './extract-devotional-text.usecase';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SendDailyDevotionalUseCase {
  private readonly logger = new Logger(SendDailyDevotionalUseCase.name);

  constructor(
    @Inject('DevotionalRepository')
    private readonly devotionalRepo: DevotionalRepository,
    private readonly httpService: HttpService,
    private readonly extractDevotional: ExtractDevotionalTextUseCase,
    private readonly whatsapp: WhatsappService,
  ) {}

  async execute(date?: string) {
    const today = date ?? new Date().toISOString().split('T')[0];
    const devotional = await this.devotionalRepo.findDevotionalByDate(today);
    let imageBuffer: Buffer | undefined;

    if (!devotional) return;

    try {
      imageBuffer = await this.downloadImageBuffer(devotional.imagePath);
      const caption = await this.extractDevotional.execute(imageBuffer);

      await this.whatsapp.sendSingleGroupMessage(
        process.env.WHATSAPP_GROUP_ID!,
        imageBuffer,
        caption,
      );
    } catch (e) {
      this.logger.error('Devotional automation failed:', e);
    } finally {
      if (imageBuffer) {
        imageBuffer.fill(0);
        imageBuffer = null;
        this.logger.log('Memory buffer cleared.');
      }
    }
  }

  private async downloadImageBuffer(url: string): Promise<Buffer> {
    const response = await this.httpService.axiosRef.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  private async downloadImage(url: string): Promise<string> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, `devotional-${Date.now()}.jpg`);

    fs.writeFileSync(filePath, response.data);

    return filePath;
  }
}
