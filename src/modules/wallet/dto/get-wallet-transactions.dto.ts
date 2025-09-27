import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  TransactionType,
  TransactionStatus,
} from '../../../enums/transaction-type.enum';

export class GetWalletTransactionsDto {
  @ApiProperty({
    description: 'نوع تراکنش برای فیلتر',
    example: 'charge',
    enum: TransactionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({
    description: 'وضعیت تراکنش برای فیلتر',
    example: 'confirmed',
    enum: TransactionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({
    description: 'تعداد روزهای گذشته برای فیلتر (مثلاً 3 برای 3 روز اخیر)',
    example: 3,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  days?: number;
}
