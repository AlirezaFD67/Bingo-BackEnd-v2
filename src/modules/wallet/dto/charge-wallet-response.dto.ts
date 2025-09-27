import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../../enums/transaction-type.enum';

export class ChargeWalletResponseDto {
  @ApiProperty({
    description: 'شناسه تراکنش',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'شناسه کاربر',
    example: 2,
  })
  userId: number;

  @ApiProperty({
    description: 'مبلغ شارژ (به تومان)',
    example: 100000,
  })
  amount: number;

  @ApiProperty({
    description: 'نوع تراکنش',
    example: 'charge',
    enum: TransactionType,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'وضعیت تراکنش',
    example: 'confirmed',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'تاریخ ایجاد تراکنش',
    example: '2024-06-20T12:34:56.789Z',
  })
  createdAt: Date;
}
