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
import { SmsService } from './sms.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpResponseDto } from './dto/request-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpCode)
    private readonly otpCodeRepository: Repository<OtpCode>,
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

      user = this.userRepository.create({
        phoneNumber,
        referredBy:
          incomingReferral && incomingReferral.trim() !== ''
            ? incomingReferral
            : otpCode.incomingReferral && otpCode.incomingReferral.trim() !== ''
              ? otpCode.incomingReferral
              : undefined,
        referralCode,
      });
      await this.userRepository.save(user);
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
}
