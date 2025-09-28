import { IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SpinWheelDto {
  @IsNumber()
  @IsIn([20000, 10000, 5000, 0], {
    message: 'Prize amount must be one of: 20000, 10000, 5000, 0',
  })
  @ApiProperty({
    example: 20000,
    description: 'مقدار جایزه گردونه (فقط مقادیر مجاز: 20000, 10000, 5000, 0)',
    enum: [20000, 10000, 5000, 0],
  })
  value: number;
}
