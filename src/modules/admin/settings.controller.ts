import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { UpdateReferralRewardConfigDto } from './dto/update-referral-reward-config.dto';
import { ReferralRewardConfigResponseDto } from './dto/referral-reward-config-response.dto';

@ApiTags('Admin-Settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put('referral-reward-config')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'به‌روزرسانی تنظیمات جایزه معرفی',
    description: 'مبلغ جایزه معرفی را به‌روزرسانی می‌کند',
  })
  @ApiResponse({
    status: 200,
    description: 'تنظیمات با موفقیت به‌روزرسانی شد',
    type: ReferralRewardConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ورودی نامعتبر',
  })
  @ApiResponse({
    status: 401,
    description: 'عدم احراز هویت',
  })
  @ApiResponse({
    status: 403,
    description: 'عدم دسترسی (نیاز به نقش ادمین)',
  })
  @ApiResponse({
    status: 404,
    description: 'تنظیمات یافت نشد',
  })
  async updateReferralRewardConfig(
    @Body() dto: UpdateReferralRewardConfigDto,
  ): Promise<ReferralRewardConfigResponseDto> {
    return this.settingsService.updateReferralRewardConfig(dto);
  }

  @Get('referral-reward-config')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت تنظیمات جایزه معرفی',
    description: 'مبلغ فعلی جایزه معرفی را برمی‌گرداند',
  })
  @ApiResponse({
    status: 200,
    description: 'تنظیمات با موفقیت دریافت شد',
    schema: {
      type: 'object',
      properties: {
        referralRewardAmount: {
          type: 'number',
          description: 'مبلغ جایزه معرفی',
          example: 15000,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'عدم احراز هویت',
  })
  @ApiResponse({
    status: 403,
    description: 'عدم دسترسی (نیاز به نقش ادمین)',
  })
  @ApiResponse({
    status: 404,
    description: 'تنظیمات یافت نشد',
  })
  async getReferralRewardConfig(): Promise<{ referralRewardAmount: number }> {
    return this.settingsService.getReferralRewardConfig();
  }
}
