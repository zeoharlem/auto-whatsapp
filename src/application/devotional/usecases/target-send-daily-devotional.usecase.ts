import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WhatsappService } from '../../../infrastructure/whatsapp/whatsapp.service';
import { ExtractDevotionalTextUseCase } from './extract-devotional-text.usecase';
import { DevotionalRepository } from '../../../domain/devotional/devotional.repository';

@Injectable()
export class TargetSendDailyDevotionalUseCase {
  private readonly logger = new Logger(TargetSendDailyDevotionalUseCase.name);

  constructor(
    @Inject('DevotionalRepository')
    private readonly devotionalRepo: DevotionalRepository,
    private readonly httpService: HttpService,
    private readonly extractDevotional: ExtractDevotionalTextUseCase,
    private readonly whatsapp: WhatsappService,
  ) {}

  async execute(date?: string) {
    let imageBuffer: Buffer | undefined;

    try {
      await this.whatsapp.ensureReady();
      const today = date ?? new Date().toISOString().split('T')[0];
      const devotional = await this.devotionalRepo.findDevotionalByDate(today);

      if (!devotional) return;

      imageBuffer = await this.downloadImageBuffer(devotional.imagePath);
      const baseCap = await this.extractDevotional.execute(imageBuffer);

      const whatsAppGroupIds: Record<string, string> = {
        PERAZIM_1: process.env.PERAZIM_1_WHATSAPP_GROUP!,
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
      await this.whatsapp.destroyClient();

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private captionBuilder(baseCaption: string, groupKey: string): string {
    const introMap: Record<string, string[]> = {
      PERAZIM_1: [
        'Good morning Perazim family 🙏',
        'Grace and peace to you, Perazim family 🌅',
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
