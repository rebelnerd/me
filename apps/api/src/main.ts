import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json } from 'express';
import { AppModule } from './app/app.module';
import { environment } from './envs/environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limit for voice capture (base64 audio)
  app.use(json({ limit: '10mb' }));

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: environment.cors.origins,
    credentials: true,
  });

  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Start
  const port = environment.port;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
