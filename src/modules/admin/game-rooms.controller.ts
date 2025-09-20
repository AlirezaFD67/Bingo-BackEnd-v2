import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GameRoomsService } from './game-rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { CreateGameRoomDto } from './dto/create-game-room.dto';
import { UpdateGameRoomDto } from './dto/update-game-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';
import { GameRoomResponseDto } from './dto/game-room-response.dto';

@ApiTags('admin-rooms')
@Controller('admin/rooms')
@UseGuards(JwtAuthGuard)
export class GameRoomsController {
  constructor(private readonly gameRoomsService: GameRoomsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت لیست اتاق‌های بازی',
    description: 'لیست اتاق‌های بازی را با امکان فیلتر بر اساس وضعیت و نوع برمی‌گرداند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست اتاق‌های بازی با موفقیت دریافت شد',
    type: [GameRoomResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  async getAllGameRooms(@Query() query: any): Promise<GameRoomResponseDto[]> {
    // تبدیل string به boolean برای isActive
    const processedQuery: GetRoomsQueryDto = {
      type: query.type ? parseInt(query.type) : undefined,
      isActive: query.isActive !== undefined ? query.isActive === 'true' || query.isActive === true : undefined,
    };
    
    return this.gameRoomsService.getAllGameRooms(processedQuery);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت اتاق بازی بر اساس ID',
    description: 'اطلاعات اتاق بازی مشخص را برمی‌گرداند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات اتاق بازی با موفقیت دریافت شد',
    type: GameRoomResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  @ApiResponse({
    status: 404,
    description: 'اتاق بازی یافت نشد',
  })
  async getGameRoomById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GameRoomResponseDto> {
    return this.gameRoomsService.getGameRoomById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ایجاد اتاق بازی جدید',
    description: 'یک اتاق بازی جدید با تنظیمات مشخص ایجاد می‌کند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 201,
    description: 'اتاق بازی با موفقیت ایجاد شد',
    type: GameRoomResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ورودی معتبر نیستند',
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  async createGameRoom(
    @Body() createGameRoomDto: CreateGameRoomDto,
  ): Promise<GameRoomResponseDto> {
    return this.gameRoomsService.createGameRoom(createGameRoomDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'به‌روزرسانی اتاق بازی',
    description: 'اطلاعات اتاق بازی مشخص را به‌روزرسانی می‌کند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'اتاق بازی با موفقیت به‌روزرسانی شد',
    type: GameRoomResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ورودی معتبر نیستند',
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  @ApiResponse({
    status: 404,
    description: 'اتاق بازی یافت نشد',
  })
  async updateGameRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameRoomDto: UpdateGameRoomDto,
  ): Promise<GameRoomResponseDto> {
    return this.gameRoomsService.updateGameRoom(id, updateGameRoomDto);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'تغییر وضعیت اتاق بازی',
    description: 'وضعیت فعال/غیرفعال اتاق بازی را تغییر می‌دهد (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'وضعیت اتاق بازی با موفقیت تغییر کرد',
    type: GameRoomResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ورودی معتبر نیستند',
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  @ApiResponse({
    status: 404,
    description: 'اتاق بازی یافت نشد',
  })
  async updateRoomStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomStatusDto: UpdateRoomStatusDto,
  ): Promise<GameRoomResponseDto> {
    return this.gameRoomsService.updateRoomStatus(id, updateRoomStatusDto);
  }
}
