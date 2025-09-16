import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpResponseDto } from './dto/request-otp-response.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  @ApiOperation({
    summary: 'درخواست کد OTP',
    description: 'ارسال کد OTP به شماره تلفن کاربر برای احراز هویت',
  })
  @ApiResponse({
    status: 201,
    description: 'کد OTP با موفقیت ارسال شد',
    type: RequestOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ورودی نامعتبر',
  })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    return this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'تایید کد OTP',
    description: 'تایید کد OTP و ایجاد توکن دسترسی',
  })
  @ApiResponse({
    status: 201,
    description: 'کد OTP تایید شد و توکن ایجاد گردید',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'کد OTP نامعتبر یا منقضی شده',
  })
  @ApiResponse({
    status: 401,
    description: 'کد OTP اشتباه',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.authService.verifyOtp(dto);
  }
}
