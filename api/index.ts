import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let server;

export default async function handler(req, res) {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }

  return server(req, res);
}
