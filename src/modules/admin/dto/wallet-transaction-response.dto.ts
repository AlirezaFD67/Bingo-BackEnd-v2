import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../../enums/transaction-type.enum';

export class WalletTransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User ID', example: 123 })
  userId: number;

  @ApiProperty({ description: 'Transaction amount', example: 10000 })
  amount: number;

  @ApiProperty({ 
    description: 'Transaction type', 
    enum: TransactionType,
    example: TransactionType.DEPOSIT 
  })
  type: TransactionType;

  @ApiProperty({ 
    description: 'Transaction status', 
    enum: TransactionStatus,
    example: TransactionStatus.CONFIRMED 
  })
  status: TransactionStatus;

  @ApiProperty({ 
    description: 'Transaction description', 
    example: 'Deposit via bank transfer',
    required: false 
  })
  description?: string;

  @ApiProperty({ 
    description: 'Transaction creation date', 
    example: '2024-01-15T10:30:00.000Z' 
  })
  createdAt: Date;
}
