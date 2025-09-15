import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
      code, // فقط در محیط development نمایش داده می‌شود
      canUseReferral,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const { phoneNumber, code, incomingReferral } = dto;

    // جستجوی OTP معتبر
    const otpCode = await this.otpCodeRepository.findOne({
      where: {
        phoneNumber,
        code,
        isVerified: false,
      },
    });

    if (!otpCode) {
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

    // اگر کاربر جدید است، ایجاد رکورد جدید
    if (!user) {
      user = this.userRepository.create({
        phoneNumber,
        referredBy: incomingReferral || otpCode.incomingReferral,
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
}
