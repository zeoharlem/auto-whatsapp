import { DevotionalRepository } from '../../../domain/devotional/devotional.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WhatsappService } from '../../../infrastructure/whatsapp/whatsapp.service';
import { ExtractDevotionalTextUseCase } from './extract-devotional-text.usecase';
import * as fs from 'fs';
import * as path from 'path';
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
      const baseCap = await this.extractDevotional.execute(imageBuffer);

      /*
       todo::-> get the whatsapp groups from api or firebase database as a list
        do not rely on the static representation of the whatsapp group id,
        get them dynamically from the api or database

        e.g const whatsAppGroupIds = await devotionalRepo.getAllWhatsAppGroup();
       */
      const whatsAppGroupIds: Record<string, string> = {
        PERAZIM_1: process.env.PERAZIM_1_WHATSAPP_GROUP!,
        PERAZIM_2: process.env.PERAZIM_2_WHATSAPP_GROUP!,
        TCC_LEADERS: process.env.TCC_LEADERS_WHATSAPP_GROUP!,
        TCC_OLOGUNERU: process.env.TCC_OLOGUNERU_WHATSAPP_GROUP!,
        PROFESSIONALS: process.env.PROFESSIONALS_WHATSAPP_GROUP!,
      };

      //Run a loop on the group ids
      for (const [groupKey, groupId] of Object.entries(whatsAppGroupIds)) {
        if (!groupId) continue;

        const caption = this.captionBuilder(baseCap, groupKey);

        this.logger.log(`Sending devotional to ${groupKey}`);

        await this.whatsapp.sendSingleGroupMessage(
          groupId,
          imageBuffer,
          caption,
        );

        //Add random delay (20–25s) to avoid meta flagging account as scam
        await this.delay(20_000 + Math.floor(Math.random() * 5000));
      }
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

  private async downloadByImagePath(url: string): Promise<string> {
    const response = await this.httpService.axiosRef.get(url, {
      responseType: 'arraybuffer',
    });

    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, `devotional-${Date.now()}.jpg`);

    fs.writeFileSync(filePath, response.data);

    return filePath;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private captionBuilder(baseCaption: string, groupKey: string): string {
    const introMap: Record<string, string[]> = {
      PERAZIM_1: [
        'Good morning Perazim family 🙏',
        'Grace and peace to you, Perazim family 🌅',
      ],
      PERAZIM_2: ['Blessed morning everyone 🌤️', 'Good morning dear family 🙏'],
      TCC_LEADERS: [
        'Good morning leaders 🙏',
        'Grace-filled morning, leaders 🌅',
      ],
      TCC_OLOGUNERU: [
        'Good morning church family 🙏',
        'Blessed morning to us all 🌤️',
      ],
      PROFESSIONALS: [
        'Good morning dear professionals 🙏',
        'Wishing you a productive day ahead 🌅',
      ],
    };

    const outroMap: Record<string, string[]> = {
      default: [
        'Have a blessed day ahead 🙏',
        'Remain blessed and fruitful 🌿',
      ],
      leaders: [
        'May God grant you wisdom today 🙏',
        'Strength and grace for leadership today 🌿',
      ],
    };

    const pickRandom = (arr: string[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    const intro = introMap[groupKey]
      ? pickRandom(introMap[groupKey])
      : 'Good morning 🙏';

    const outro =
      groupKey === 'TCC_LEADERS'
        ? pickRandom(outroMap.leaders)
        : pickRandom(outroMap.default);

    return `${intro}\n\n${baseCaption}\n\n${outro}`;
  }
}
