import {
  IsString,
  IsOptional,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be in format 09xxxxxxxxx',
  })
  @ApiProperty({
    example: '09112223332',
    description: 'شماره تلفن همراه کاربر (۱۱ رقم، شروع با ۰۹)',
  })
  phoneNumber: string;

  @IsString()
  @Length(4, 4, { message: 'OTP code must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'OTP code must contain only digits' })
  @ApiProperty({
    example: '1234',
    description: 'کد OTP ۴ رقمی',
  })
  code: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.incomingReferral && o.incomingReferral.length > 0)
  @Length(6, 6, { message: 'Referral code must be exactly 6 characters' })
  @ApiProperty({
    example: '',
    description: 'کد رفرال ورودی (اختیاری، ۶ کاراکتر)',
    required: false,
  })
  incomingReferral?: string;
}
