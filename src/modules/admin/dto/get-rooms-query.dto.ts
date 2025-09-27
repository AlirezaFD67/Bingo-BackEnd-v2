import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { RoomType } from '../../../enums/room-type.enum';

export class GetRoomsQueryDto {
  @ApiProperty({
    description: 'فیلتر بر اساس نوع اتاق',
    enum: RoomType,
    example: RoomType.GLOBAL,
    required: false,
  })
  @IsOptional()
  @IsInt()
  type?: RoomType;

  @ApiProperty({
    description: 'فیلتر بر اساس وضعیت فعال بودن',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
