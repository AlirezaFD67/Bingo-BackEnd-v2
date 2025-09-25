import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, GameRoom, ActiveRoomGlobal]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'your-super-secret-jwt-key-here-change-in-production',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}


