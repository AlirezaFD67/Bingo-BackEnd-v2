import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min, IsOptional, IsBoolean } from 'class-validator';
import { RoomType } from '../../../enums/room-type.enum';

export class UpdateGameRoomDto {
  @ApiProperty({
    description: 'هزینه ورود به اتاق',
    example: 1000,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  entryFee?: number;

  @ApiProperty({
    description: 'تایمر شروع بازی (ثانیه)',
    example: 30,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  startTimer?: number;

  @ApiProperty({
    description: 'وضعیت فعال بودن اتاق',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'نوع اتاق',
    enum: RoomType,
    example: RoomType.GLOBAL,
    required: false,
  })
  @IsOptional()
  @IsInt()
  type?: RoomType;

  @ApiProperty({
    description: 'حداقل تعداد بازیکنان',
    example: 2,
    minimum: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(2)
  minPlayers?: number;
}
