import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { GetWalletTransactionsQueryDto } from './dto/get-wallet-transactions-query.dto';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';
import { WithdrawWalletResponseDto } from '../wallet/dto/withdraw-wallet-response.dto';

@ApiTags('Admin-Wallet')
@Controller('admin/wallet')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('transactions')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get wallet transactions',
    description: 'Retrieve all wallet transactions with optional type filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet transactions retrieved successfully',
    type: [WalletTransactionResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getTransactions(
    @Query() query: GetWalletTransactionsQueryDto,
  ): Promise<WalletTransactionResponseDto[]> {
    return this.walletService.getTransactions(query);
  }

  @Post('withdraw/confirm/:txId')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'تایید برداشت',
    description: 'تایید درخواست برداشت توسط ادمین',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'برداشت تایید شد.',
    type: WithdrawWalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'تراکنش یافت نشد',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'تراکنش قابل تایید نیست',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'دسترسی غیرمجاز',
  })
  async confirmWithdraw(
    @Param('txId', ParseIntPipe) txId: number,
  ): Promise<WithdrawWalletResponseDto> {
    return this.walletService.confirmWithdraw(txId);
  }

  @Post('withdraw/reject/:txId')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'رد برداشت',
    description: 'رد درخواست برداشت توسط ادمین و بازگشت مبلغ به کیف پول',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'برداشت رد شد و مبلغ به کیف پول بازگشت.',
    type: WithdrawWalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'تراکنش یافت نشد',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'تراکنش قابل رد نیست',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'کاربر احراز هویت نشده',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'دسترسی غیرمجاز',
  })
  async rejectWithdraw(
    @Param('txId', ParseIntPipe) txId: number,
  ): Promise<WithdrawWalletResponseDto> {
    return this.walletService.rejectWithdraw(txId);
  }
}
