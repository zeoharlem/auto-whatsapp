import { Module } from '@nestjs/common';
import { SendDailyDevotionalUseCase } from './devotional/usecases/send-daily-devotional.usecase';
import { ExtractDevotionalTextUseCase } from './devotional/usecases/extract-devotional-text.usecase';
import { FirestoreDevotionalRepository } from '../infrastructure/firestore/firestore.respository';
import { AiModule } from '../infrastructure/ai/ai.module';
import { HttpModule } from '@nestjs/axios';
import { WhatsappModule } from '../infrastructure/whatsapp/whatsapp.module';
import { FirestoreModule } from '../infrastructure/firestore/firestore.module';

@Module({
  imports: [AiModule, HttpModule, WhatsappModule, FirestoreModule],
  providers: [
    SendDailyDevotionalUseCase,
    ExtractDevotionalTextUseCase,

    {
      provide: 'DevotionalRepository',
      useClass: FirestoreDevotionalRepository,
    },
  ],
  exports: [SendDailyDevotionalUseCase],
})
export class DevotionalModule {}
