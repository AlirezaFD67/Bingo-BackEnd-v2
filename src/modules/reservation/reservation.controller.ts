import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationService } from './reservation.service';
import { ReserveRequestDto } from './dto/reserve-request.dto';

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
}


