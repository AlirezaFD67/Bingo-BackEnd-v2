import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { Card } from '../../entities/card.entity';
import { User } from '../../entities/user.entity';
import { RoomStatus } from '../../enums/room-status.enum';
import { ReserveRequestDto } from './dto/reserve-request.dto';
import { RoomCardDto } from './dto/room-cards-response.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(GameRoom)
    private readonly gameRoomRepository: Repository<GameRoom>,
    @InjectRepository(ActiveRoomGlobal)
    private readonly activeRoomRepository: Repository<ActiveRoomGlobal>,
    @InjectRepository(UserReservedCard)
    private readonly userReservedCardRepository: Repository<UserReservedCard>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async reserve(userId: number, dto: ReserveRequestDto) {
    if (!userId) {
      throw new BadRequestException('Invalid user');
    }

    const active = await this.activeRoomRepository.findOne({ where: { id: dto.activeRoomId } });
    if (!active) {
      throw new NotFoundException('Active room not found');
    }
    if (active.status !== RoomStatus.PENDING) {
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

  async getRoomCards(activeRoomId: number): Promise<RoomCardDto[]> {
    const reservedCards = await this.userReservedCardRepository.find({
      where: { activeRoomId },
      relations: ['card', 'user'],
    });

    return reservedCards.map((reservedCard) => ({
      cardId: reservedCard.card.id,
      matrix: reservedCard.card.matrix,
      owner: {
        userId: reservedCard.user.id,
        username: reservedCard.user.username || `user_${reservedCard.user.id}`,
      },
      activeRoomId: reservedCard.activeRoomId,
      reservedAt: reservedCard.createdAt,
    }));
  }
}


