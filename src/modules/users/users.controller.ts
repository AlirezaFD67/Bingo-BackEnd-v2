import {
  Controller,
  Get,
  Put,
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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  phoneNumber: string;
  role: string;
}

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
    description:
      'پروفایل کامل کاربر شامل اطلاعات شخصی، کارت بانکی، شماره شبا و لیست رزروها را برمی‌گرداند',
  })
  @ApiResponse({
    status: 200,
    description: 'پروفایل کاربر با موفقیت دریافت شد',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر یافت نشد',
  })
  async getProfile(@Req() req: Request): Promise<UserProfileResponseDto> {
    const user = req.user as AuthenticatedUser;
    return this.usersService.getProfile(Number(user.id));
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'به‌روزرسانی پروفایل کاربر فعلی',
    description: 'پروفایل کاربر را با اطلاعات جدید به‌روزرسانی می‌کند',
  })
  @ApiBody({
    type: UpdateUserProfileDto,
    description: 'اطلاعات جدید برای به‌روزرسانی پروفایل',
  })
  @ApiResponse({
    status: 200,
    description: 'پروفایل با موفقیت به‌روزرسانی شد',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'داده‌های ورودی نامعتبر هستند',
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر یافت نشد',
  })
  @ApiResponse({
    status: 409,
    description: 'نام کاربری تکراری است',
  })
  async updateProfile(
    @Req() req: Request,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = req.user as AuthenticatedUser;
    return this.usersService.updateProfile(Number(user.id), updateData);
  }
}
