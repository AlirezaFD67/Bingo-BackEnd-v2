import { ApiProperty } from '@nestjs/swagger';

export class SpinWheelResponseDto {
  @ApiProperty({
    example: true,
    description: 'وضعیت موفقیت عملیات',
  })
  success: boolean;

  @ApiProperty({
    example: 20000,
    description: 'مقدار جایزه دریافت شده',
  })
  prizeAmount: number;

  @ApiProperty({
    example: 150000,
    description: 'موجودی جدید کیف پول کاربر',
  })
  newBalance: number;

  @ApiProperty({
    example: 'جایزه گردونه با موفقیت ثبت شد',
    description: 'پیام توضیحی',
  })
  message: string;
}
