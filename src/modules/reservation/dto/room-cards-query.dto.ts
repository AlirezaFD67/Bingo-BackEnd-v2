import { IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RoomCardsQueryDto {
  @ApiProperty({
    description: 'ID of the active room',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  activeRoomId: number;
}
