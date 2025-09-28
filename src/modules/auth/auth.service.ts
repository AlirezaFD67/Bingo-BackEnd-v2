import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';
import { OtpCode } from '../../entities/otp-code.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { AppSettings } from '../../entities/app-settings.entity';
import { SmsService } from './sms.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpResponseDto } from './dto/request-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import { TransactionType } from '../../enums/transaction-type.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpCode)
    private readonly otpCodeRepository: Repository<OtpCode>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(AppSettings)
    private readonly appSettingsRepository: Repository<AppSettings>,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    const { phoneNumber, incomingReferral } = dto;

    // بررسی وجود شماره تلفن در جدول users
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    // بررسی اعتبار کد رفرال اگر ارائه شده
    if (incomingReferral) {
      const referralUser = await this.userRepository.findOne({
        where: { referralCode: incomingReferral },
      });

      if (!referralUser) {
        throw new BadRequestException(
          ERROR_MESSAGES.INVALID_REFERRAL_CODE.error,
        );
      }
    }

    // تعیین canUseReferral
    let canUseReferral = false;
    if (!existingUser && !incomingReferral) {
      canUseReferral = true;
    }

    // تولید کد OTP ۴ رقمی تصادفی
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // زمان انقضا: ۳۰ دقیقه بعد
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // ذخیره در دیتابیس
    const otpCode = this.otpCodeRepository.create({
      phoneNumber,
      code,
      incomingReferral,
      expiresAt,
    });

    await this.otpCodeRepository.save(otpCode);

    // ارسال SMS (فعلاً فقط لاگ می‌کند)
    await this.smsService.sendOtp(phoneNumber, code);

    return {
      message: 'OTP sent successfully',
      phoneNumber,
      code, // فقط در محیط development نمایش داده می‌شود
      canUseReferral,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const { phoneNumber, code, incomingReferral } = dto;

    // بررسی اعتبار کد رفرال اگر ارائه شده
    if (incomingReferral) {
      const referralUser = await this.userRepository.findOne({
        where: { referralCode: incomingReferral },
      });

      if (!referralUser) {
        throw new BadRequestException(
          ERROR_MESSAGES.INVALID_REFERRAL_CODE.error,
        );
      }
    }

    // جستجوی OTP معتبر
    const otpCode = await this.otpCodeRepository.findOne({
      where: {
        phoneNumber,
        code,
        isVerified: false,
      },
    });

    if (!otpCode) {
      console.log(
        `OTP verification failed: No OTP found for phone ${phoneNumber} with code ${code}`,
      );
      throw new BadRequestException('Invalid OTP code');
    }

    // بررسی انقضا
    if (otpCode.expiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired');
    }

    // بروزرسانی OTP به عنوان verified
    await this.otpCodeRepository.update(otpCode.id, {
      isVerified: true,
      verifiedAt: new Date(),
    });

    // بررسی وجود کاربر
    let user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    // اگر کاربر جدید است، ایجاد رکورد جدید با کد رفرال
    if (!user) {
      const referralCode = await this.generateUniqueReferralCode();
      const finalReferralCode =
        incomingReferral && incomingReferral.trim() !== ''
          ? incomingReferral
          : otpCode.incomingReferral && otpCode.incomingReferral.trim() !== ''
            ? otpCode.incomingReferral
            : undefined;

      user = this.userRepository.create({
        phoneNumber,
        referredBy: finalReferralCode,
        referralCode,
      });
      await this.userRepository.save(user);

      // اگر کاربر با کد رفرال ثبت نام کرده، پاداش به کاربر معرف بده
      if (finalReferralCode) {
        await this.giveReferralReward(finalReferralCode, user.id);
      }
    }

    // تولید JWT token
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      hasUsername: !!user.username,
    };
  }

  /**
   * تولید کد رفرال ۶ رقمی منحصر به فرد
   */
  private async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // جلوگیری از حلقه بی‌نهایت

    do {
      // تولید کد ۶ رقمی تصادفی
      referralCode = Math.floor(100000 + Math.random() * 900000).toString();

      // بررسی منحصر به فرد بودن
      const existingUser = await this.userRepository.findOne({
        where: { referralCode },
      });

      isUnique = !existingUser;
      attempts++;

      // اگر بعد از چندین تلاش موفق نشد، کد را با timestamp ترکیب کن
      if (attempts >= maxAttempts && !isUnique) {
        const timestamp = Date.now().toString().slice(-4); // ۴ رقم آخر timestamp
        referralCode =
          Math.floor(1000 + Math.random() * 9000).toString() + timestamp;
      }
    } while (!isUnique && attempts < maxAttempts + 1);

    return referralCode;
  }

  /**
   * اعطای پاداش رفرال به کاربر معرف
   */
  private async giveReferralReward(
    referralCode: string,
    newUserId: number,
  ): Promise<void> {
    try {
      // یافتن کاربر معرف
      const referrerUser = await this.userRepository.findOne({
        where: { referralCode },
      });

      if (!referrerUser) {
        console.error(
          `Referrer user not found for referral code: ${referralCode}`,
        );
        return;
      }

      // دریافت مبلغ پاداش رفرال از تنظیمات
      const referralRewardSetting = await this.appSettingsRepository.findOne({
        where: { key: 'referral_reward_amount' },
      });

      if (!referralRewardSetting) {
        console.error('Referral reward amount setting not found');
        return;
      }

      const rewardAmount = parseInt(referralRewardSetting.value, 10);

      if (rewardAmount <= 0) {
        console.log(
          'Referral reward amount is zero or negative, skipping reward',
        );
        return;
      }

      // بروزرسانی موجودی کیف پول کاربر معرف
      const newBalance = referrerUser.walletBalance + rewardAmount;
      await this.userRepository.update(referrerUser.id, {
        walletBalance: newBalance,
      });

      // ایجاد تراکنش کیف پول
      const transaction = this.walletTransactionRepository.create({
        userId: referrerUser.id,
        amount: rewardAmount,
        type: TransactionType.REFERRAL_BONUS,
        description: `پاداش معرفی کاربر جدید (ID: ${newUserId})`,
      });

      await this.walletTransactionRepository.save(transaction);

      console.log(
        `Referral reward of ${rewardAmount} given to user ${referrerUser.id} for referring user ${newUserId}`,
      );
    } catch (error) {
      console.error('Error giving referral reward:', error);
      // در صورت خطا، فرایند ثبت نام را متوقف نکنیم
    }
  }
}
