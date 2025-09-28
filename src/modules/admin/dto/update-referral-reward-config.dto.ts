import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReferralRewardConfigDto {
  @ApiProperty({
    description: 'مبلغ جایزه معرفی',
    example: 15000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'مبلغ جایزه معرفی باید عدد باشد' })
  @IsPositive({ message: 'مبلغ جایزه معرفی باید مثبت باشد' })
  @Min(0, { message: 'مبلغ جایزه معرفی نمی‌تواند منفی باشد' })
  referralRewardAmount: number;
}
