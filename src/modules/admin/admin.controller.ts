import {
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { AdminUserResponseDto } from '../users/dto/admin-user-response.dto';

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
}
