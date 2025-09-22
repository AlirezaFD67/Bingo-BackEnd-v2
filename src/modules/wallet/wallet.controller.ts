import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { ChargeWalletDto } from './dto/charge-wallet.dto';
import { ChargeWalletResponseDto } from './dto/charge-wallet-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('charge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'شارژ کیف پول',
    description: 'شارژ کیف پول کاربر با مبلغ مشخص شده',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'تراکنش شارژ ثبت شد.',
    type: ChargeWalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'داده‌های ورودی نامعتبر',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'کاربر یافت نشد',
  })
  async chargeWallet(
    @Body() chargeDto: ChargeWalletDto,
    @Request() req: any,
  ): Promise<ChargeWalletResponseDto> {
    const userId = req.user.id;
    return this.walletService.chargeWallet(userId, chargeDto);
  }
}
