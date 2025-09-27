import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Reservation } from '../../entities/reservation.entity';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { CardTransactionService } from '../wallet/card-transaction.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly cardTransactionService: CardTransactionService,
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

    // محاسبه مبلغ کارت‌های رزرو شده در روم‌های pending
    const reservedCardsAmount =
      await this.cardTransactionService.calculateUserReservedCardsAmount(
        userId,
      );

    // محاسبه موجودی قابل استفاده (کسر مبلغ کارت‌های رزرو شده)
    const availableWalletBalance =
      Number(user.walletBalance) - reservedCardsAmount;

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
      walletBalance: Number(user.walletBalance), // موجودی واقعی در دیتابیس
      availableWalletBalance, // موجودی قابل استفاده (کم شده از کارت‌های pending)
      createdAt: user.createdAt,
      createdAtPersian,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      reservations: reservations.map((reservation) => ({
        activeRoomId: reservation.activeRoomId,
        cardCount: reservation.cardCount,
        entryFee: Number(reservation.entryFee),
        status: reservation.status,
      })),
    };
  }

  async getAllUsers(): Promise<AdminUserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      bankCardNumber: user.bankCardNumber,
      shebaNumber: user.shebaNumber,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      role: user.role,
      walletBalance: Number(user.walletBalance),
      createdAt: user.createdAt,
      createdAtPersian: this.convertToPersianDate(user.createdAt),
    }));
  }

  async getUserById(id: number): Promise<AdminUserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      bankCardNumber: user.bankCardNumber,
      shebaNumber: user.shebaNumber,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      role: user.role,
      walletBalance: Number(user.walletBalance),
      createdAt: user.createdAt,
      createdAtPersian: this.convertToPersianDate(user.createdAt),
    };
  }

  async updateProfile(
    userId: number,
    updateData: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // Check if username is being updated and if it's already taken
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateData.username },
      });

      if (existingUser) {
        throw new ConflictException(
          'این نام کاربری قبلاً توسط کاربر دیگری استفاده شده است',
        );
      }
    }

    // Update user fields - handle empty strings as null
    if (updateData.username !== undefined)
      user.username = updateData.username || undefined;
    if (updateData.firstName !== undefined)
      user.firstName = updateData.firstName || undefined;
    if (updateData.lastName !== undefined)
      user.lastName = updateData.lastName || undefined;
    if (updateData.bankCardNumber !== undefined)
      user.bankCardNumber = updateData.bankCardNumber || undefined;
    if (updateData.shebaNumber !== undefined)
      user.shebaNumber = updateData.shebaNumber || undefined;

    // Save the updated user
    await this.userRepository.save(user);

    // Return the updated profile
    return this.getProfile(userId);
  }

  async updateUserById(
    id: number,
    updateData: UpdateUserProfileDto,
  ): Promise<AdminUserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // Check if username is being updated and if it's already taken
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateData.username },
      });

      if (existingUser) {
        throw new ConflictException(
          'این نام کاربری قبلاً توسط کاربر دیگری استفاده شده است',
        );
      }
    }

    // Update user fields - handle empty strings as null
    if (updateData.username !== undefined)
      user.username = updateData.username || undefined;
    if (updateData.firstName !== undefined)
      user.firstName = updateData.firstName || undefined;
    if (updateData.lastName !== undefined)
      user.lastName = updateData.lastName || undefined;
    if (updateData.bankCardNumber !== undefined)
      user.bankCardNumber = updateData.bankCardNumber || undefined;
    if (updateData.shebaNumber !== undefined)
      user.shebaNumber = updateData.shebaNumber || undefined;

    // Save the updated user
    await this.userRepository.save(user);

    // Return the updated user data
    return this.getUserById(id);
  }

  private convertToPersianDate(date: Date): string {
    // Convert Gregorian date to Persian (Jalali) calendar
    // This is a simple implementation - you might want to use a proper Persian date library
    const gregorianYear = date.getFullYear();
    const gregorianMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
    const gregorianDay = date.getDate();

    // Simple conversion (approximate)
    const persianYear = gregorianYear - 621;
    const persianMonth =
      gregorianMonth > 3 ? gregorianMonth - 3 : gregorianMonth + 9;
    const persianDay = gregorianDay;

    return `${persianYear.toString().padStart(4, '0')}/${persianMonth.toString().padStart(2, '0')}/${persianDay.toString().padStart(2, '0')}`;
  }
}
