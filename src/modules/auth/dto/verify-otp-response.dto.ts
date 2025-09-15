import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'توکن دسترسی JWT'
  })
  accessToken: string;

  @ApiProperty({
    example: true,
    description: 'آیا کاربر نام کاربری دارد یا نه'
  })
  hasUsername: boolean;
}

