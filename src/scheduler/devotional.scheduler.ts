import { SendDailyDevotionalUseCase } from '../application/usecases/send-daily-devotional.usecase';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DevotionalScheduler {
  constructor(
    private readonly sendDailyDevotional: SendDailyDevotionalUseCase,
  ) {}

  /** @Cron('0 6 * * *'): 6AM cronjob **/
  @Cron('0 6 * * *', { timeZone: 'Africa/Lagos' })
  async handleDailyDevotional() {
    await this.sendDailyDevotional.execute();
  }
}
