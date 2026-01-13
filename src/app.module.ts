import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './infrastructure/whatsapp/whatsapp.module';
import { DevotionalService } from './infrastructure/devotional/devotional.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SendDailyDevotionalUseCase } from './application/usecases/send-daily-devotional.usecase';
import { DevotionalScheduler } from './scheduler/devotional.scheduler';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './infrastructure/ai/gemini.service';
import { AiModule } from './infrastructure/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WhatsappModule,
    ScheduleModule.forRoot(),
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DevotionalService,
    {
      provide: 'DevotionalRepository',
      useExisting: DevotionalService,
    },
    SendDailyDevotionalUseCase,
    DevotionalScheduler,
    GeminiService,
  ],
})
export class AppModule {}
