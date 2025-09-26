import {
  Controller,
  Post,
  Get,
  Body,
  Query,
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
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { WithdrawWalletResponseDto } from './dto/withdraw-wallet-response.dto';
import { GetWalletTransactionsDto } from './dto/get-wallet-transactions.dto';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';
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

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'برداشت از کیف پول',
    description: 'درخواست برداشت از کیف پول کاربر با مبلغ مشخص شده',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'درخواست برداشت ثبت شد.',
    type: WithdrawWalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'داده‌های ورودی نامعتبر یا موجودی کافی نیست',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'کاربر یافت نشد',
  })
  async withdrawWallet(
    @Body() withdrawDto: WithdrawWalletDto,
    @Request() req: any,
  ): Promise<WithdrawWalletResponseDto> {
    const userId = req.user.id;
    return this.walletService.withdrawWallet(userId, withdrawDto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'دریافت لیست تراکنش‌های کیف پول',
    description: 'دریافت لیست تراکنش‌های کیف پول کاربر با قابلیت فیلتر بر اساس نوع، وضعیت و تعداد روزهای گذشته',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'لیست تراکنش‌های کیف پول کاربر',
    type: [WalletTransactionResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'کاربر یافت نشد',
  })
  async getWalletTransactions(
    @Query() filters: GetWalletTransactionsDto,
    @Request() req: any,
  ): Promise<WalletTransactionResponseDto[]> {
    const userId = req.user.id;
    return this.walletService.getWalletTransactions(userId, filters);
  }
}
