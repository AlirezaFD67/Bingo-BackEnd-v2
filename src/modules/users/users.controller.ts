import { Controller, Get, UseGuards, Req, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت پروفایل کاربر فعلی',
    description: 'پروفایل کامل کاربر شامل اطلاعات شخصی، کارت بانکی، شماره شبا و لیست رزروها را برمی‌گرداند'
  })
  @ApiResponse({
    status: 200,
    description: 'پروفایل کاربر با موفقیت دریافت شد',
    type: UserProfileResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر احراز هویت نشده'
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر یافت نشد'
  })
  async getProfile(@Req() req: Request): Promise<UserProfileResponseDto> {
    const user = req.user as any;
    return this.usersService.getProfile(user.id);
  }
}
