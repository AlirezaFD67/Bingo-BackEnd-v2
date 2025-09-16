import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Reservation } from '../../entities/reservation.entity';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async getProfile(userId: number): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reservations = await this.reservationRepository.find({
      where: { userId },
      select: ['activeRoomId', 'cardCount', 'entryFee', 'status'],
    });

    const createdAtPersian = this.convertToPersianDate(user.createdAt);

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      bankCardNumber: user.bankCardNumber,
      shebaNumber: user.shebaNumber,
      role: user.role,
      createdAt: user.createdAt,
      createdAtPersian,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      reservations: reservations.map(reservation => ({
        activeRoomId: reservation.activeRoomId,
        cardCount: reservation.cardCount,
        entryFee: Number(reservation.entryFee),
        status: reservation.status,
      })),
    };
  }

  private convertToPersianDate(date: Date): string {
    // Convert Gregorian date to Persian (Jalali) calendar
    // This is a simple implementation - you might want to use a proper Persian date library
    const gregorianYear = date.getFullYear();
    const gregorianMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
    const gregorianDay = date.getDate();

    // Simple conversion (approximate)
    const persianYear = gregorianYear - 621;
    const persianMonth = gregorianMonth > 3 ? gregorianMonth - 3 : gregorianMonth + 9;
    const persianDay = gregorianDay;

    return `${persianYear.toString().padStart(4, '0')}/${persianMonth.toString().padStart(2, '0')}/${persianDay.toString().padStart(2, '0')}`;
  }
}

