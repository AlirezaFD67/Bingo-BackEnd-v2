import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { GetWalletTransactionsQueryDto } from './dto/get-wallet-transactions-query.dto';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';

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
    description: 'Retrieve all wallet transactions with optional type filter'
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
}
