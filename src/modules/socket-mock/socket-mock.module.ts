import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketMockController } from './socket-mock.controller';
import { SocketMockService } from './socket-mock.service';
import { RoomsService } from '../socket/rooms.service';
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
  controllers: [SocketMockController],
  providers: [SocketMockService, RoomsService],
  exports: [SocketMockService],
})
export class SocketMockModule {}
