import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { ReserveRequestDto } from './dto/reserve-request.dto';
import { ReserveResponseDto } from './dto/reserve-response.dto';
import { RoomCardsQueryDto } from './dto/room-cards-query.dto';
import { RoomCardDto } from './dto/room-cards-response.dto';

@ApiTags('reservation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('reserve')
  @ApiOperation({
    summary: 'رزرو کارت برای اتاق فعال',
    description: 'کاربر می‌تواند کارت‌هایی را برای اتاق فعال رزرو کند',
  })
  @ApiResponse({
    status: 201,
    description: 'رزرو با موفقیت انجام شد',
    type: ReserveResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'درخواست نامعتبر',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Room is not pending' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'عدم احراز هویت',
  })
  @ApiResponse({
    status: 404,
    description: 'اتاق فعال یا کاربر پیدا نشد',
  })
  reserve(
    @Req() req: any,
    @Body() dto: ReserveRequestDto,
  ): Promise<ReserveResponseDto> {
    const userId = req.user?.id;
    return this.reservationService.reserve(userId, dto);
  }

  @Get('room-cards')
  @ApiOperation({
    summary: 'Get all cards of an active room with owner information',
  })
  @ApiResponse({
    status: 200,
    description: 'List of room cards with owner information',
    type: [RoomCardDto],
  })
  async getRoomCards(
    @Query() query: RoomCardsQueryDto,
  ): Promise<RoomCardDto[]> {
    return this.reservationService.getRoomCards(query.activeRoomId);
  }
}
