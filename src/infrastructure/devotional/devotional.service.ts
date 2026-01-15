import { Inject, Injectable, Logger } from '@nestjs/common';
import { Devotional } from 'src/domain/devotional/devotional.entity';
import { FirestoreDevotionalRepository } from '../firestore/firestore.respository';

@Injectable()
export class DevotionalService {
  constructor(
    @Inject('FirestoreDevotionalRepository')
    private readonly repository: FirestoreDevotionalRepository,
  ) {}

  private readonly logger = new Logger(DevotionalService.name);
  private readonly today = new Date();

  async getTodayDevotional(): Promise<Devotional> {
    const devotional = await this.repository.findDevotionalByDate(
      this.today.toString(),
    );
    return new Devotional(devotional.imagePath, this.today.toString());
  }
}
