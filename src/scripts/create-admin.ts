import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  // TODO: Implement admin user creation logic
  console.log('Admin creation script - to be implemented');
  await app.close();
}

bootstrap();
