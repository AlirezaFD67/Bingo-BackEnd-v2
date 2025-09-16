import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { UsersService } from '../users/users.service';
import { User } from '../../entities/user.entity';
import { Reservation } from '../../entities/reservation.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Reservation]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminController],
  providers: [UsersService],
})
export class AdminModule {}
