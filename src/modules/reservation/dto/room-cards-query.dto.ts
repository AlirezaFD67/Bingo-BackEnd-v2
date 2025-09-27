import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class RoomCardsQueryDto {
  @ApiProperty({
    description: 'ID of the active room',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  activeRoomId: number;
}
