import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WheelSpin } from '../../entities/wheel-spin.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { TransactionType } from '../../enums/transaction-type.enum';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import { SpinWheelDto, SpinWheelResponseDto, CanSpinResponseDto } from './dto';

@Injectable()
export class WheelService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WheelSpin)
    private readonly wheelSpinRepository: Repository<WheelSpin>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  /**
   * بررسی می‌کند که آیا کاربر می‌تواند گردونه بچرخاند یا نه
   */
  async canSpin(userId: number): Promise<CanSpinResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND.error);
    }

    const lastSpin = await this.wheelSpinRepository.findOne({
      where: { userId },
      order: { lastSpinAt: 'DESC' },
    });

    if (!lastSpin) {
      return {
        canSpin: true,
      };
    }

    const now = new Date();
    const timeSinceLastSpin = now.getTime() - lastSpin.lastSpinAt.getTime();
    const hours24InMs = 24 * 60 * 60 * 1000; // 24 ساعت به میلی‌ثانیه

    if (timeSinceLastSpin >= hours24InMs) {
      return {
        canSpin: true,
      };
    }

    // محاسبه زمان باقی‌مانده
    const remainingTimeMs = hours24InMs - timeSinceLastSpin;
    const remainingHours = Math.floor(remainingTimeMs / (60 * 60 * 1000));
    const remainingMinutes = Math.floor(
      (remainingTimeMs % (60 * 60 * 1000)) / (60 * 1000),
    );

    return {
      canSpin: false,
      remainingTime: `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`,
    };
  }

  /**
   * چرخش گردونه و دریافت جایزه
   */
  async spinWheel(
    userId: number,
    dto: SpinWheelDto,
  ): Promise<SpinWheelResponseDto> {
    // بررسی وجود کاربر
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND.error);
    }

    // بررسی محدودیت زمانی
    const canSpinResult = await this.canSpin(userId);
    if (!canSpinResult.canSpin) {
      throw new BadRequestException(
        ERROR_MESSAGES.WHEEL_SPIN_LIMIT_EXCEEDED.error,
      );
    }

    // اعتبارسنجی مقدار جایزه
    const allowedAmounts = [20000, 10000, 5000, 0];
    if (!allowedAmounts.includes(dto.value)) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_WHEEL_PRIZE_AMOUNT.error,
      );
    }

    // ذخیره چرخش در دیتابیس
    const wheelSpin = this.wheelSpinRepository.create({
      userId,
      prizeAmount: dto.value,
      lastSpinAt: new Date(),
    });

    await this.wheelSpinRepository.save(wheelSpin);

    let newBalance = Number(user.walletBalance);

    // اگر جایزه بیشتر از صفر است، به کیف پول اضافه کن
    if (dto.value > 0) {
      newBalance = Number(user.walletBalance) + dto.value;

      // بروزرسانی موجودی کیف پول
      await this.userRepository.update(userId, {
        walletBalance: newBalance,
      });

      // ثبت تراکنش برای جایزه گردونه
      const transaction = this.walletTransactionRepository.create({
        userId,
        amount: dto.value,
        type: TransactionType.WHEEL_SPIN,
        description: 'جایزه گردونه',
      });

      await this.walletTransactionRepository.save(transaction);
    }

    return {
      success: true,
      prizeAmount: dto.value,
      newBalance,
      message:
        dto.value > 0 ? 'جایزه گردونه با موفقیت ثبت شد' : 'چرخش گردونه ثبت شد',
    };
  }
}
