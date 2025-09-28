import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../../../enums/room-type.enum';

export class GameRoomResponseDto {
  @ApiProperty({
    description: 'شناسه یکتای اتاق',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'هزینه ورود به اتاق',
    example: 1000,
  })
  entryFee: number;

  @ApiProperty({
    description: 'تایمر شروع بازی (ثانیه)',
    example: 30,
  })
  startTimer: number;

  @ApiProperty({
    description: 'وضعیت فعال بودن اتاق',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'نوع اتاق',
    enum: RoomType,
    example: RoomType.GLOBAL,
  })
  type: RoomType;

  @ApiProperty({
    description: 'حداقل تعداد بازیکنان',
    example: 2,
  })
  minPlayers: number;

  @ApiProperty({
    description: 'تاریخ ایجاد',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
