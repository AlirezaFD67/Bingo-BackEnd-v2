import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { GameRoomsController } from './game-rooms.controller';
import { SettingsController } from './settings.controller';
import { UsersService } from '../users/users.service';
import { GameRoomsService } from './game-rooms.service';
import { SettingsService } from './settings.service';
import { User } from '../../entities/user.entity';
import { Reservation } from '../../entities/reservation.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { AppSettings } from '../../entities/app-settings.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Reservation, GameRoom, AppSettings]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminController, GameRoomsController, SettingsController],
  providers: [UsersService, GameRoomsService, SettingsService],
})
export class AdminModule {}
