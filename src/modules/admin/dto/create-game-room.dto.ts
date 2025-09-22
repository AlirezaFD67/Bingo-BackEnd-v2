import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';
import { RoomType } from '../../../enums/room-type.enum';

export class CreateGameRoomDto {
  @ApiProperty({
    description: 'هزینه ورود به اتاق',
    example: 1000,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  entryFee: number;

  @ApiProperty({
    description: 'تایمر شروع بازی (ثانیه)',
    example: 30,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  startTimer: number;

  @ApiProperty({
    description: 'نوع اتاق',
    enum: RoomType,
    example: RoomType.GLOBAL,
  })
  @IsInt()
  type: RoomType;

  @ApiProperty({
    description: 'حداقل تعداد بازیکنان',
    example: 2,
    minimum: 2,
  })
  @IsInt()
  @IsPositive()
  @Min(2)
  minPlayers: number;
}


