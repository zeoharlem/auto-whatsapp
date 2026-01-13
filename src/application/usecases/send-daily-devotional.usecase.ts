import { DevotionalRepository } from '../../domain/devotional.repository';
import { Inject, Injectable } from '@nestjs/common';
import { WhatsappService } from '../../infrastructure/whatsapp/whatsapp.service';

@Injectable()
export class SendDailyDevotionalUseCase {
  constructor(
    @Inject('DevotionalRepository')
    private readonly devotionalRepo: DevotionalRepository,
    private readonly whatsapp: WhatsappService,
  ) {}

  async execute() {
    const devotional = await this.devotionalRepo.getTodayDevotional();

    await this.whatsapp.sendSingleGroupMessage(
      process.env.WHATSAPP_GROUP_ID!,
      devotional.imagePath,
      devotional.caption,
    );
  }
}
