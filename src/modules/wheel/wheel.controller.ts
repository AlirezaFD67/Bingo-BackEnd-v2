import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  Body,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { WheelService } from './wheel.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpinWheelDto, SpinWheelResponseDto, CanSpinResponseDto } from './dto';

interface AuthenticatedUser {
  id: string;
  phoneNumber: string;
  role: string;
}

@ApiTags('wheel')
@Controller('wheel')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  @Get('can-spin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'بررسی مجاز بودن چرخش گردونه',
    description:
      'بررسی می‌کند که آیا کاربر می‌تواند گردونه بچرخاند یا نه. هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند.',
  })
  @ApiResponse({
    status: 200,
    description: 'وضعیت مجاز بودن چرخش گردونه',
    type: CanSpinResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'عدم احراز هویت',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر پیدا نشد',
  })
  async canSpin(@Req() req: Request): Promise<CanSpinResponseDto> {
    const user = req.user as AuthenticatedUser;
    return this.wheelService.canSpin(Number(user.id));
  }

  @Post('spin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'چرخش گردونه و دریافت جایزه',
    description:
      'سیستم چرخش گردونه به کاربران امکان دریافت جایزه از طریق چرخش گردونه را می‌دهد. هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند.',
  })
  @ApiBody({
    type: SpinWheelDto,
    description: 'مقدار جایزه گردونه',
  })
  @ApiResponse({
    status: 200,
    description: 'چرخش با موفقیت انجام شد',
    type: SpinWheelResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'درخواست نامعتبر (محدودیت زمانی یا مقدار جایزه نامعتبر)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'شما فقط یکبار در 24 ساعت می‌توانید گردونه بچرخانید',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'عدم احراز هویت',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر پیدا نشد',
  })
  async spinWheel(
    @Req() req: Request,
    @Body() dto: SpinWheelDto,
  ): Promise<SpinWheelResponseDto> {
    const user = req.user as AuthenticatedUser;
    return this.wheelService.spinWheel(Number(user.id), dto);
  }
}
