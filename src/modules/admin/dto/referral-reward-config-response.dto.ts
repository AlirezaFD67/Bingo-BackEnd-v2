import { ApiProperty } from '@nestjs/swagger';

export class ReferralRewardConfigResponseDto {
  @ApiProperty({
    description: 'مبلغ جایزه معرفی',
    example: 15000,
  })
  referralRewardAmount: number;

  @ApiProperty({
    description: 'پیام موفقیت',
    example: 'تنظیمات جایزه معرفی با موفقیت به‌روزرسانی شد',
  })
  message: string;
}
