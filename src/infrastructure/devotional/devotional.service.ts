import { Injectable } from '@nestjs/common';
import { DevotionalRepository } from '../../domain/devotional.repository';
import { Devotional } from 'src/domain/devotional.entity';
import * as fs from 'fs';

@Injectable()
export class DevotionalService implements DevotionalRepository {
  async getTodayDevotional(): Promise<Devotional> {
    const images = fs.readdirSync('devotionals');
    const image = images[Math.floor(Math.random() * images.length)];

    return new Devotional(
      `devotionals/${image}`,
      'Automated Testing Daily Devotional',
      'Today is the day the Lord has made',
    );
  }
}
