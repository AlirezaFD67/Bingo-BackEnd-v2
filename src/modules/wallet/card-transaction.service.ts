import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { RoomStatus } from '../../enums/room-status.enum';

@Injectable()
export class CardTransactionService {
  constructor(
    @InjectRepository(UserReservedCard)
    private readonly userReservedCardRepository: Repository<UserReservedCard>,
  ) {}


  /**
   * محاسبه مبلغ کارت‌های رزرو شده برای یک کاربر در روم‌های pending
   */
  async calculateUserReservedCardsAmount(userId: number): Promise<number> {
    const reservedCards = await this.userReservedCardRepository
      .createQueryBuilder('urc')
      .leftJoin('urc.activeRoom', 'ar')
      .leftJoin('ar.gameRoom', 'gr')
      .where('urc.userId = :userId', { userId })
      .andWhere('ar.status = :status', { status: RoomStatus.PENDING })
      .select(['urc.id', 'ar.gameRoomId', 'gr.entryFee'])
      .getMany();

    let totalAmount = 0;
    const roomFeesMap = new Map<number, number>();

    reservedCards.forEach(card => {
      const gameRoomId = card.activeRoom.gameRoomId;
      const entryFee = card.activeRoom.gameRoom.entryFee;
      
      if (!roomFeesMap.has(gameRoomId)) {
        roomFeesMap.set(gameRoomId, entryFee);
      }
    });

    roomFeesMap.forEach(entryFee => {
      totalAmount += entryFee;
    });

    return totalAmount;
  }
}
