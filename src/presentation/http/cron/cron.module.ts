import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { DevotionalModule } from '../../../application/devotional.module';

@Module({
  imports: [DevotionalModule],
  controllers: [CronController],
})
export class CronModule {}
