import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  //app.setGlobalPrefix('api');

  if (process.env.VERCEL) {
    await app.init();
    return;
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
