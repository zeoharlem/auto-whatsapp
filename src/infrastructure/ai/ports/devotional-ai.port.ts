import { DevotionalModel } from '../../../domain/models/devotional.model';

export interface DevotionalAiPort {
  extractDailyDevotionFromImage(image: Buffer): Promise<DevotionalModel>;
}
