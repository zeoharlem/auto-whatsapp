import { DevotionalRepository } from '../../domain/devotional.repository';
import { Devotional } from '../../domain/devotional.entity';
import { Inject, Injectable } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import Firestore = firestore.Firestore;

@Injectable()
export class FirestoreDevotionalRepository implements DevotionalRepository {
  constructor(
    @Inject('FIRESTORE')
    private readonly firestore: Firestore,
  ) {}

  async findDevotionalByDate(date: string): Promise<Devotional | null> {
    const doc = await this.firestore.collection('devotionals').doc(date).get();

    if (!doc.exists) return null;

    const data = doc.data();
    if (!data?.imagePath) return null;

    return new Devotional(data.imagePath, date);
  }
}
