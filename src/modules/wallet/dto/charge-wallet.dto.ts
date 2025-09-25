import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChargeWalletDto {
  @ApiProperty({
    description: 'مبلغ شارژ کیف پول (به ریال)',
    example: 100000,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'مبلغ شارژ الزامی است' })
  @IsNumber({}, { message: 'مبلغ شارژ باید عدد باشد' })
  @IsPositive({ message: 'مبلغ شارژ باید مثبت باشد' })
  amount: number;
}
