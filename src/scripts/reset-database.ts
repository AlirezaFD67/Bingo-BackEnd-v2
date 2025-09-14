import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // TODO: Implement database reset logic
  console.log('Database reset script - to be implemented');
  await app.close();
}

bootstrap();
