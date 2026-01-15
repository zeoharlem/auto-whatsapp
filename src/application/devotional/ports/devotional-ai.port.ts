import { DevotionalModel } from '../../../domain/devotional/models/devotional.model';

export interface DevotionalAiPort {
  extractDailyDevotionFromImage(image: Buffer): Promise<DevotionalModel>;
}
