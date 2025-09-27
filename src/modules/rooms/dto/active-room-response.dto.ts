import { ApiProperty } from '@nestjs/swagger';
import { RoomStatus } from '../../../enums/room-status.enum';
import { RoomType } from '../../../enums/room-type.enum';

export class GameRoomDto {
  @ApiProperty({
    description: 'شناسه یکتای اتاق بازی',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'نام اتاق',
    example: 'VIP Room',
  })
  name: string;

  @ApiProperty({
    description: 'هزینه ورود به اتاق',
    example: 100000,
  })
  entryFee: number;

  @ApiProperty({
    description: 'تایمر شروع بازی (ثانیه)',
    example: 100,
  })
  startTimer: number;

  @ApiProperty({
    description: 'وضعیت فعال بودن اتاق',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'تاریخ ایجاد',
    example: '2024-03-20T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'تاریخ ایجاد به شمسی',
    example: '1403/01/01',
  })
  createdAtPersian: string;

  @ApiProperty({
    description: 'نوع اتاق',
    enum: RoomType,
    example: 1,
  })
  type: RoomType;

  @ApiProperty({
    description: 'حداقل تعداد بازیکنان',
    example: 3,
  })
  minPlayers: number;
}

export class ActiveRoomResponseDto {
  @ApiProperty({
    description: 'شناسه یکتای اتاق فعال',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'وضعیت اتاق',
    enum: RoomStatus,
    example: 'pending',
  })
  status: RoomStatus;

  @ApiProperty({
    description: 'زمان شروع',
    example: '2024-06-25T18:00:00Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'اطلاعات اتاق بازی',
    type: GameRoomDto,
  })
  gameRoom: GameRoomDto;
}
