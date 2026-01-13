import { Devotional } from './devotional.entity';

export interface DevotionalRepository {
  getTodayDevotional(): Promise<Devotional>;
}
