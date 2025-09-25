import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActiveRoomGlobal,
      GameRoom,
      Reservation,
      DrawnNumber,
    ]),
  ],
  providers: [RoomsGateway, RoomsService],
  exports: [RoomsService],
})
export class SocketModule {}
