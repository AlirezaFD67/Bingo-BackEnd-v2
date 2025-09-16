import {
  IsString,
  IsOptional,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/, {
    message: 'Phone number must be in format 09xxxxxxxxx',
  })
  @ApiProperty({
    example: '09112223332',
    description: 'شماره تلفن همراه کاربر (۱۱ رقم، شروع با ۰۹)',
  })
  phoneNumber: string;

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
