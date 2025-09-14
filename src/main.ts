// Polyfill for crypto in production environments
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

declare module 'express-session' {
  interface SessionData {
    verificationCode?: string;
    phoneNumber?: string;
    userExists?: boolean;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure session
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'default-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: undefined, // Session cookie will be deleted when the browser is closed
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Bingo API')
    .setDescription('The Bingo Game API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayRequestDuration: true,
      syntaxHighlight: {
        theme: 'monokai',
      },
    },
    customSiteTitle: 'Bingo Game API Documentation',
  });

  await app.listen(3006);
}
bootstrap();