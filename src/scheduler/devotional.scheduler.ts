import { SendDailyDevotionalUseCase } from '../application/usecases/send-daily-devotional.usecase';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DevotionalScheduler {
  constructor(
    private readonly sendDailyDevotional: SendDailyDevotionalUseCase,
  ) {}

  //@Cron('0 6 * * *')
  @Cron('35 1 * * *', { timeZone: 'Africa/Lagos' })
  async handleDailyDevotional() {
    console.log('GROUP_ID:', process.env.WHATSAPP_GROUP_ID);
    await this.sendDailyDevotional.execute();
  }
}
