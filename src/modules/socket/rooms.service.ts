import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { RoomStatus } from '../../enums/room-status.enum';
import { PendingRoomDto } from './dto/pending-rooms-response.dto';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    @InjectRepository(ActiveRoomGlobal)
    private activeRoomRepository: Repository<ActiveRoomGlobal>,
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
  ) {}

  async getPendingRooms(): Promise<PendingRoomDto[]> {
    try {
      // Get all active rooms with pending or started status
      const activeRooms = await this.activeRoomRepository.find({
        where: [
          { status: RoomStatus.PENDING },
          { status: RoomStatus.STARTED },
        ],
        relations: ['gameRoom'],
      });

      const result: PendingRoomDto[] = [];

      for (const activeRoom of activeRooms) {
        // Count unique players for this active room
        const playerCountResult = await this.reservationRepository
          .createQueryBuilder('reservation')
          .where('reservation.activeRoomId = :activeRoomId', { 
            activeRoomId: activeRoom.id 
          })
          .select('COUNT(DISTINCT reservation.userId)', 'count')
          .getRawOne();

        const playerCount = parseInt(playerCountResult?.count || '0');

        result.push({
          activeRoomId: activeRoom.id,
          gameRoomId: activeRoom.gameRoomId,
          remainingSeconds: activeRoom.remainingSeconds,
          playerCount: playerCount,
          entryFee: activeRoom.gameRoom.entryFee,
          status: activeRoom.status,
          minPlayers: activeRoom.gameRoom.minPlayers,
        });
      }

      this.logger.log(`Found ${result.length} pending/started rooms`);
      return result;
    } catch (error) {
      this.logger.error('Error fetching pending rooms:', error);
      throw error;
    }
  }
}
