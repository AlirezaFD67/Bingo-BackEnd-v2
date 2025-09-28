import { ApiProperty } from '@nestjs/swagger';

export class ReserveResponseDto {
  @ApiProperty({
    description: 'شناسه رزرو ایجاد شده',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'موجودی واقعی کیف پول کاربر (به تومان)',
    example: 500000,
  })
  walletBalance: number;

  @ApiProperty({
    description:
      'موجودی قابل استفاده (کم شده از کارت‌های رزرو شده در روم‌های pending)',
    example: 450000,
  })
  availableWalletBalance: number;
}
