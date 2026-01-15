import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './infrastructure/whatsapp/whatsapp.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SendDailyDevotionalUseCase } from './application/devotional/usecases/send-daily-devotional.usecase';
import { DevotionalScheduler } from './scheduler/devotional.scheduler';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './infrastructure/ai/ai.module';
import { FirestoreDevotionalRepository } from './infrastructure/firestore/firestore.respository';
import { FirestoreModule } from './infrastructure/firestore/firestore.module';
import { HttpModule } from '@nestjs/axios';
import { CronController } from './presentation/http/cron/cron.controller';
import { CronModule } from './presentation/http/cron/cron.module';
import { DevotionalModule } from './application/devotional.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WhatsappModule,
    ScheduleModule.forRoot(),
    HttpModule,
    AiModule,
    FirestoreModule,
    CronModule,
    DevotionalModule,
  ],
  controllers: [AppController, CronController],
  providers: [
    AppService,
    FirestoreDevotionalRepository,
    {
      provide: 'DevotionalRepository',
      useExisting: FirestoreDevotionalRepository,
    },

    // 🔹 Use cases & scheduler
    SendDailyDevotionalUseCase,
    DevotionalScheduler,
  ],
})
export class AppModule {}
