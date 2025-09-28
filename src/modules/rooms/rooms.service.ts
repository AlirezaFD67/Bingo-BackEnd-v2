import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { ActiveRoomResponseDto } from './dto/active-room-response.dto';

@Injectable()
export class ActiveRoomsService {
  constructor(
    @InjectRepository(ActiveRoomGlobal)
    private readonly activeRoomRepository: Repository<ActiveRoomGlobal>,
    @InjectRepository(GameRoom)
    private readonly gameRoomRepository: Repository<GameRoom>,
  ) {}

  async getActiveRoomById(id: number): Promise<ActiveRoomResponseDto> {
    const activeRoom = await this.activeRoomRepository.findOne({
      where: { id },
      relations: ['gameRoom'],
    });

    if (!activeRoom) {
      throw new NotFoundException(ERROR_MESSAGES.ACTIVE_ROOM_NOT_FOUND.error);
    }

    // Convert Persian date (you might need to implement a proper Persian date converter)
    const createdAtPersian = this.convertToPersianDate(
      activeRoom.gameRoom.createdAt,
    );

    return {
      id: activeRoom.id,
      status: activeRoom.status,
      startTime: activeRoom.createdAt.toISOString(),
      gameRoom: {
        id: activeRoom.gameRoom.id,
        name: `Room ${activeRoom.gameRoom.id}`, // You might want to add a name field to GameRoom entity
        entryFee: activeRoom.gameRoom.entryFee,
        startTimer: activeRoom.gameRoom.startTimer,
        isActive: activeRoom.gameRoom.isActive,
        createdAt: activeRoom.gameRoom.createdAt,
        createdAtPersian,
        type: activeRoom.gameRoom.type,
        minPlayers: activeRoom.gameRoom.minPlayers,
      },
    };
  }

  private convertToPersianDate(date: Date): string {
    // Simple Persian date conversion - you might want to use a proper library like moment-jalaali
    // This is a basic implementation
    const persianMonths = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];

    const year = date.getFullYear() - 621; // Approximate conversion
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
  }
}
