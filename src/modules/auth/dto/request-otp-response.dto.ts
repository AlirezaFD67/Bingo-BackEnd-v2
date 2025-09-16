import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpResponseDto {
  @ApiProperty({
    example: 'OTP sent successfully',
    description: 'پیام موفقیت',
  })
  message: string;

  @ApiProperty({
    example: '09123456789',
    description: 'شماره تلفن همراه کاربر',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '1234',
    description: 'کد OTP تولید شده (فقط در محیط development نمایش داده می‌شود)',
  })
  code: string;

  @ApiProperty({
    example: true,
    description: 'آیا کاربر می‌تواند از رفرال استفاده کند یا نه',
  })
  canUseReferral: boolean;
}
