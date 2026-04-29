import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './logger/winston-logger';
import helmet from 'helmet';

const cookieParser = require('cookie-parser');
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  // Helmet.js - Dodaj bezpieczne nagłówki HTTP
  app.use(helmet());

  // Cookie Parser - Parse cookies z requestów
  app.use(cookieParser());

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174'
    ],
    credentials: true, // Pozwól na cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  await app.listen(process.env.PORT ?? 3000);

  // Włącz weryfikację wszystkich przychodzących żądań
  
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  ); 
}

bootstrap();
