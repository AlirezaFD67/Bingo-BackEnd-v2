import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { RoomStatus } from '../../enums/room-status.enum';

@Injectable()
export class CardTransactionService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  /**
   * محاسبه مبلغ کارت‌های رزرو شده برای یک کاربر در روم‌های pending
   */
  async calculateUserReservedCardsAmount(userId: number): Promise<number> {
    const reservations = await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('r.activeRoom', 'ar')
      .where('r.userId = :userId', { userId })
      .andWhere('ar.status = :status', { status: RoomStatus.PENDING })
      .andWhere('r.status = :reservationStatus', {
        reservationStatus: 'pending',
      })
      .select(['r.id', 'r.cardCount', 'r.entryFee', 'ar.id'])
      .getMany();

    let totalAmount = 0;

    reservations.forEach((reservation) => {
      // محاسبه مبلغ کل برای این رزرو: تعداد کارت × هزینه ورودی
      const reservationTotal =
        reservation.cardCount * Number(reservation.entryFee);
      totalAmount += reservationTotal;
    });

    return totalAmount;
  }
}
