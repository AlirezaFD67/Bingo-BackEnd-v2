import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../../enums/transaction-type.enum';

export class WithdrawWalletResponseDto {
  @ApiProperty({
    description: 'شناسه تراکنش',
    example: 2,
  })
  id: number;

  @ApiProperty({
    description: 'شناسه کاربر',
    example: 2,
  })
  userId: number;

  @ApiProperty({
    description: 'مبلغ برداشت (به تومان) - منفی نشان‌دهنده برداشت است',
    example: -50000,
  })
  amount: number;

  @ApiProperty({
    description: 'نوع تراکنش',
    example: 'withdraw',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'وضعیت تراکنش',
    example: 'pending',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'تاریخ ایجاد تراکنش',
    example: '2024-06-20T12:35:56.789Z',
  })
  createdAt: Date;
}
