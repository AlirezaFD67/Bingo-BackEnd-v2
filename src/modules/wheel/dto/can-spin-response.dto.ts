import { ApiProperty } from '@nestjs/swagger';

export class CanSpinResponseDto {
  @ApiProperty({
    example: true,
    description: 'آیا کاربر می‌تواند گردونه بچرخاند یا نه',
  })
  canSpin: boolean;

  @ApiProperty({
    example: '05:30',
    description: 'زمان باقی‌مانده تا چرخش بعدی (فرمت hh:mm)',
    required: false,
  })
  remainingTime?: string;
}
