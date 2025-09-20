import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRoomStatusDto {
  @ApiProperty({
    description: 'وضعیت فعال بودن اتاق',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
