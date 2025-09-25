import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { Card } from '../../entities/card.entity';
import { ActiveRoomWinner } from '../../entities/active-room-winners.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActiveRoomGlobal,
      GameRoom,
      Reservation,
      DrawnNumber,
      UserReservedCard,
      Card,
      ActiveRoomWinner,
    ]),
  ],
  providers: [RoomsGateway, RoomsService],
  exports: [RoomsService],
})
export class SocketModule {}
