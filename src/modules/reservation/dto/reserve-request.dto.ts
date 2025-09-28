import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReserveRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  activeRoomId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  cardCount: number;
}
