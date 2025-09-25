import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActiveRoomsService } from './rooms.service';
import { ActiveRoomResponseDto } from './dto/active-room-response.dto';

@ApiTags('rooms')
@Controller('rooms')
@UseGuards() // No authentication required for this endpoint
@UseInterceptors(ClassSerializerInterceptor)
export class RoomsController {
  constructor(private readonly roomsService: ActiveRoomsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'دریافت اطلاعات اتاق فعال',
    description: 'اطلاعات یک اتاق فعال را بر اساس شناسه برمی‌گرداند',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات اتاق فعال با موفقیت دریافت شد',
    type: ActiveRoomResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'اتاق فعال یافت نشد',
  })
  async getActiveRoomById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ActiveRoomResponseDto> {
    return this.roomsService.getActiveRoomById(id);
  }
}
