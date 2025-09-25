import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../enums/transaction-type.enum';

export class GetWalletTransactionsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter transactions by type',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
