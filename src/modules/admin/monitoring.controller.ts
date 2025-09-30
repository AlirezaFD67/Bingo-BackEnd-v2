import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AutoTimerService } from './auto-timer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('admin-monitoring')
@Controller('admin/monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly autoTimerService: AutoTimerService) {}

  @Get('timer-status')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت وضعیت تایمر اتاق‌ها',
    description:
      'اطلاعات وضعیت تایمر تمام اتاق‌های فعال را برمی‌گرداند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'وضعیت تایمر اتاق‌ها با موفقیت دریافت شد',
    schema: {
      type: 'object',
      properties: {
        totalRooms: { type: 'number', example: 10 },
        pendingRooms: { type: 'number', example: 7 },
        startedRooms: { type: 'number', example: 3 },
        errorRooms: { type: 'number', example: 0 },
        mainLoopActive: { type: 'boolean', example: true },
        syncLoopActive: { type: 'boolean', example: true },
        rooms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              activeRoomId: { type: 'number' },
              gameRoomId: { type: 'number' },
              status: { type: 'string', enum: ['pending', 'started', 'finished', 'deactivated'] },
              remainingSeconds: { type: 'number' },
              drawnCount: { type: 'number' },
              remainingCount: { type: 'number' },
              errorCount: { type: 'number' },
              lastError: { type: 'string', nullable: true },
              timeSinceLastSync: { type: 'number' },
              timeSinceLastDraw: { type: 'number', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  async getTimerStatus() {
    return this.autoTimerService.getActiveRoomsStatus();
  }

  @Get('health')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'بررسی سلامت سیستم تایمر',
    description:
      'اطلاعات کامل سلامت سیستم تایمر شامل وضعیت حافظه، دیتابیس و مشکلات احتمالی را برمی‌گرداند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات سلامت سیستم با موفقیت دریافت شد',
    schema: {
      type: 'object',
      properties: {
        isHealthy: { type: 'boolean', example: true },
        timestamp: { type: 'string', format: 'date-time' },
        memoryState: {
          type: 'object',
          properties: {
            totalRooms: { type: 'number', example: 10 },
            pendingRooms: { type: 'number', example: 7 },
            startedRooms: { type: 'number', example: 3 },
            errorRooms: { type: 'number', example: 0 },
          },
        },
        databaseState: {
          type: 'object',
          properties: {
            pendingRooms: { type: 'number', example: 7 },
            startedRooms: { type: 'number', example: 3 },
          },
        },
        loops: {
          type: 'object',
          properties: {
            mainLoopActive: { type: 'boolean', example: true },
            mainLoopInterval: { type: 'number', example: 1000 },
            syncLoopActive: { type: 'boolean', example: true },
            syncInterval: { type: 'number', example: 5000 },
          },
        },
        issues: {
          type: 'object',
          properties: {
            problematicRooms: { type: 'number', example: 0 },
            outOfSyncRooms: { type: 'number', example: 0 },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  activeRoomId: { type: 'number' },
                  errorCount: { type: 'number' },
                  lastError: { type: 'string' },
                  timeSinceLastSync: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  async getHealthCheck() {
    return this.autoTimerService.healthCheck();
  }
}

