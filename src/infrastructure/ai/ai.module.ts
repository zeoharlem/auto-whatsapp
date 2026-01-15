import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ExtractDevotionalTextUseCase } from '../../application/usecases/extract-devotional-text.usecase';
import { OpenAiDevotionalAdapter } from './adapters/openai-devotional.adapter';

@Module({
  providers: [
    GeminiService,
    ExtractDevotionalTextUseCase,
    {
      provide: 'DevotionalAiPort',
      useClass: OpenAiDevotionalAdapter, //GeminiService
    },
  ],
  exports: [
    ExtractDevotionalTextUseCase, // used by SendDailyDevotionalUseCase
    'DevotionalAiPort',
  ],
})
export class AiModule {}
