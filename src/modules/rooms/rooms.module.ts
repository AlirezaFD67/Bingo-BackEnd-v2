import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { ActiveRoomsService } from './rooms.service';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActiveRoomGlobal, GameRoom])],
  controllers: [RoomsController],
  providers: [ActiveRoomsService],
  exports: [ActiveRoomsService],
})
export class RoomsModule {}
