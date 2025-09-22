import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const formatBankCardNumber = ({ value }: { value: unknown }): string | undefined => {
  if (typeof value === 'string' && value) {
    // Remove spaces to ensure it's always displayed without spaces
    return value.replace(/\s+/g, '');
  }
  return value as string | undefined;
};

export class AdminUserResponseDto {
  @ApiProperty({
    description: 'شناسه کاربر',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'نام کاربری',
    example: 'john_doe',
    required: false,
  })
  @Expose()
  username?: string;

  @ApiProperty({
    description: 'نام',
    example: 'علی',
    required: false,
  })
  @Expose()
  firstName?: string;

  @ApiProperty({
    description: 'نام خانوادگی',
    example: 'احمدی',
    required: false,
  })
  @Expose()
  lastName?: string;

  @ApiProperty({
    description: 'شماره تلفن',
    example: '09123456789',
  })
  @Expose()
  phoneNumber: string;

  @ApiProperty({
    description: 'شماره کارت بانکی',
    example: '1111222233334444',
    required: false,
  })
  @Expose()
  @Transform(formatBankCardNumber)
  bankCardNumber?: string;

  @ApiProperty({
    description: 'شماره شبا',
    example: 'IR123456789012345678901234',
    required: false,
  })
  @Expose()
  shebaNumber?: string;

  @ApiProperty({
    description: 'کد معرف',
    example: '12345',
    required: false,
  })
  @Expose()
  referralCode?: string;

  @ApiProperty({
    description: 'کد معرف کننده',
    example: '67890',
    required: false,
  })
  @Expose()
  referredBy?: string;

  @ApiProperty({
    description: 'نقش کاربر',
    example: 'USER',
    enum: ['USER', 'ADMIN'],
  })
  @Expose()
  role: string;

  @ApiProperty({
    description: 'موجودی کیف پول (به ریال)',
    example: 500000,
  })
  @Expose()
  walletBalance: number;

  @ApiProperty({
    description: 'تاریخ ایجاد حساب (میلادی)',
    example: '2024-06-20T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'تاریخ ایجاد حساب (شمسی)',
    example: '1403/03/31',
  })
  @Expose()
  createdAtPersian: string;
}
