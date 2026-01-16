import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();

export default async (req, res) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Important: If your frontend is on a different domain
  app.enableCors();

  await app.init();
  server(req, res);
};
