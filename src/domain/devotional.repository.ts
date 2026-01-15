import { Devotional } from './devotional.entity';

export interface DevotionalRepository {
  findDevotionalByDate(date: string): Promise<Devotional | null>;
}
