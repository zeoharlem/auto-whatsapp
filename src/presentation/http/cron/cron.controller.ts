import { Controller, Post } from '@nestjs/common';
import { SendDailyDevotionalUseCase } from '../../../application/devotional/usecases/send-daily-devotional.usecase';

@Controller('cron')
export class CronController {
  constructor(
    private readonly sendDailyDevotional: SendDailyDevotionalUseCase,
  ) {}

  /*
    hit this endpoint if you are using http cronjob
  */
  @Post('devotional')
  async handleDailyDevotional() {
    await this.sendDailyDevotional.execute();
    return { status: 'ok' };
  }
}
