import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import AppDataSource from '../data-source';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = AppDataSource;
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const userRepository = dataSource.getRepository(User);

  try {
    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.phoneNumber);
      return;
    }

    // Create admin user
    const adminUser = userRepository.create({
      phoneNumber: '09123456789',
      role: UserRole.ADMIN,
      firstName: 'ادمین',
      lastName: 'سیستم',
    });

    await userRepository.save(adminUser);
    console.log('Admin user created successfully:', adminUser.phoneNumber);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await dataSource.destroy();
    await app.close();
  }
}

bootstrap();
