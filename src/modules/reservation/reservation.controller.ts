import { Body, Controller, Post, Get, Req, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { ReserveRequestDto } from './dto/reserve-request.dto';
import { RoomCardsQueryDto } from './dto/room-cards-query.dto';
import { RoomCardDto } from './dto/room-cards-response.dto';

@ApiTags('reservation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('reserve')
  reserve(@Req() req: any, @Body() dto: ReserveRequestDto) {
    const userId = req.user?.id;
    return this.reservationService.reserve(userId, dto);
  }

  @Get('room-cards')
  @ApiOperation({ summary: 'Get all cards of an active room with owner information' })
  @ApiResponse({
    status: 200,
    description: 'List of room cards with owner information',
    type: [RoomCardDto],
  })
  async getRoomCards(@Query() query: RoomCardsQueryDto): Promise<RoomCardDto[]> {
    return this.reservationService.getRoomCards(query.activeRoomId);
  }
}


