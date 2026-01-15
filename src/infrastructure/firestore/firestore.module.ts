import { Module } from '@nestjs/common';
import { FirestoreProvider } from './firestore.provider';

@Module({
  providers: [FirestoreProvider],
  exports: [FirestoreProvider],
})
export class FirestoreModule {}
