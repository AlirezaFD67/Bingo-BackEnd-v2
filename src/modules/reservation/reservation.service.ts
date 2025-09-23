import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { ActiveRoomGlobal, ActiveRoomStatus } from '../../entities/active-room-global.entity';
import { ReserveRequestDto } from './dto/reserve-request.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(GameRoom)
    private readonly gameRoomRepository: Repository<GameRoom>,
    @InjectRepository(ActiveRoomGlobal)
    private readonly activeRoomRepository: Repository<ActiveRoomGlobal>,
  ) {}

  async reserve(userId: number, dto: ReserveRequestDto) {
    if (!userId) {
      throw new BadRequestException('Invalid user');
    }

    const active = await this.activeRoomRepository.findOne({ where: { id: dto.activeRoomId } });
    if (!active) {
      throw new NotFoundException('Active room not found');
    }
    if (active.status !== ActiveRoomStatus.PENDING) {
      throw new BadRequestException('Room is not pending');
    }

    const gameRoom = await this.gameRoomRepository.findOne({ where: { id: active.gameRoomId } });
    if (!gameRoom) {
      throw new NotFoundException('Game room not found');
    }

    const reservation = this.reservationRepository.create({
      userId,
      cardCount: dto.cardCount,
      entryFee: gameRoom.entryFee,
      activeRoomId: active.id,
    });

    const saved = await this.reservationRepository.save(reservation);
    return { id: saved.id };
  }
}


