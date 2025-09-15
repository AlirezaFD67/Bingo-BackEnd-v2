import { IsString, IsOptional, Length, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'Phone number must be in format 09xxxxxxxxx' })
  @ApiProperty({
    example: '09123456789',
    description: 'شماره تلفن همراه کاربر (۱۱ رقم، شروع با ۰۹)'
  })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.incomingReferral && o.incomingReferral.length > 0)
  @Length(5, 5, { message: 'Referral code must be exactly 5 characters' })
  @ApiProperty({
    example: 'ABC12',
    description: 'کد رفرال ورودی (اختیاری، ۵ کاراکتر)',
    required: false
  })
  incomingReferral?: string;
}

