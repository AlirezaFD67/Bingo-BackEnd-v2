import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { AdminUserResponseDto } from '../users/dto/admin-user-response.dto';
import { UpdateUserProfileDto } from '../users/dto/update-user-profile.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت لیست همه کاربران',
    description: 'لیست کامل کاربران سیستم را برمی‌گرداند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست کاربران با موفقیت دریافت شد',
    type: [AdminUserResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  async getAllUsers(): Promise<AdminUserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Get('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'دریافت کاربر بر اساس ID',
    description: 'اطلاعات کاربر مشخص را برمی‌گرداند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات کاربر با موفقیت دریافت شد',
    type: AdminUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'توکن معتبر نیست یا کاربر ادمین نیست',
  })
  @ApiResponse({
    status: 404,
    description: 'کاربر یافت نشد',
  })
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminUserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @Put('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'به‌روزرسانی اطلاعات کاربر',
    description: 'اطلاعات کاربر مشخص را به‌روزرسانی می‌کند (فقط برای ادمین‌ها)',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
    type: AdminUserResponseDto,
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
    description: 'کاربر یافت نشد',
  })
  @ApiResponse({
    status: 409,
    description: 'نام کاربری تکراری است',
  })
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserProfileDto,
  ): Promise<AdminUserResponseDto> {
    return this.usersService.updateUserById(id, updateData);
  }
}
