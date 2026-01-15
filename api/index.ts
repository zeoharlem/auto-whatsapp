import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

/*
let server;
export default async function handler(req, res) {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    server = app.getHttpAdapter().getInstance();
  }

  return server(req, res);
}
*/
const server = express();

export default async (req, res) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Important: If your frontend is on a different domain
  app.enableCors();

  await app.init();
  server(req, res);
};
