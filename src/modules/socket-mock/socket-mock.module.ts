import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketMockController } from './socket-mock.controller';
import { SocketMockService } from './socket-mock.service';
import { RoomsService } from '../socket/rooms.service';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActiveRoomGlobal,
      GameRoom,
      Reservation,
    ]),
  ],
  controllers: [SocketMockController],
  providers: [SocketMockService, RoomsService],
  exports: [SocketMockService],
})
export class SocketMockModule {}
