import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { GameRoomsController } from './game-rooms.controller';
import { SettingsController } from './settings.controller';
import { WalletController } from './wallet.controller';
import { UsersService } from '../users/users.service';
import { GameRoomsService } from './game-rooms.service';
import { SettingsService } from './settings.service';
import { WalletService } from './wallet.service';
import { AutoTimerService } from './auto-timer.service';
import { User } from '../../entities/user.entity';
import { Reservation } from '../../entities/reservation.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { AppSettings } from '../../entities/app-settings.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { Card } from '../../entities/card.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Reservation, GameRoom, AppSettings, WalletTransaction, ActiveRoomGlobal, Card, UserReservedCard, DrawnNumber]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminController, GameRoomsController, SettingsController, WalletController],
  providers: [UsersService, GameRoomsService, SettingsService, WalletService, AutoTimerService],
})
export class AdminModule {}
