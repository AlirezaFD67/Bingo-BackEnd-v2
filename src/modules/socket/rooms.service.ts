import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';
import { RoomStatus } from '../../enums/room-status.enum';
import { PendingRoomDto } from './dto/pending-rooms-response.dto';
import { RoomInfoResponseDto } from './dto/room-info-response.dto';

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
    @InjectRepository(DrawnNumber)
    private drawnNumberRepository: Repository<DrawnNumber>,
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

  async getRoomInfo(activeRoomId: number): Promise<RoomInfoResponseDto> {
    try {
      // Get the active room with its game room
      const activeRoom = await this.activeRoomRepository.findOne({
        where: { id: activeRoomId },
        relations: ['gameRoom'],
      });

      if (!activeRoom) {
        throw new Error(`Active room with ID ${activeRoomId} not found`);
      }

      // Count total reserved cards for this active room
      const reservedCardsResult = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.activeRoomId = :activeRoomId', { 
          activeRoomId: activeRoomId 
        })
        .select('SUM(reservation.cardCount)', 'totalCards')
        .getRawOne();

      const reservedCards = parseInt(reservedCardsResult?.totalCards || '0');
      const availableCards = 30 - reservedCards; // 30 is the maximum cards per room

      // Count unique players for this active room
      const playerCountResult = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.activeRoomId = :activeRoomId', { 
          activeRoomId: activeRoomId 
        })
        .select('COUNT(DISTINCT reservation.userId)', 'count')
        .getRawOne();

      const playerCount = parseInt(playerCountResult?.count || '0');

      const result: RoomInfoResponseDto = {
        status: activeRoom.status,
        remainingSeconds: activeRoom.remainingSeconds,
        availableCards: availableCards,
        playerCount: playerCount,
      };

      this.logger.log(`Room info for activeRoomId ${activeRoomId}: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching room info for activeRoomId ${activeRoomId}:`, error);
      throw error;
    }
  }

  async getDrawnNumbers(activeRoomId: number): Promise<{ drawnNumbers: number[]; total: number }> {
    // Fetch all drawn numbers for the room ordered by createdAt ASC
    const rows = await this.drawnNumberRepository.find({
      where: { activeRoomId },
      order: { createdAt: 'ASC' },
      select: ['number'],
    });
    const numbers = rows.map((r) => r.number);
    return { drawnNumbers: numbers, total: numbers.length };
  }
}
