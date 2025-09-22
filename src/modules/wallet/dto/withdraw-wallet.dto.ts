import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawWalletDto {
  @ApiProperty({
    description: 'مبلغ برداشت (به ریال)',
    example: 50000,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'مبلغ برداشت الزامی است' })
  @IsNumber({}, { message: 'مبلغ برداشت باید عدد باشد' })
  @IsPositive({ message: 'مبلغ برداشت باید مثبت باشد' })
  amount: number;
}
