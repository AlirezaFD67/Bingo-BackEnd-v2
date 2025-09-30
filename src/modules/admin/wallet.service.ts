import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { User } from '../../entities/user.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../../enums/transaction-type.enum';
import { GetWalletTransactionsQueryDto } from './dto/get-wallet-transactions-query.dto';
import { AdminWalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';
import { WithdrawWalletResponseDto } from '../wallet/dto/withdraw-wallet-response.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async getTransactions(
    query: GetWalletTransactionsQueryDto,
  ): Promise<AdminWalletTransactionResponseDto[]> {
    const queryBuilder = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .orderBy('transaction.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: query.type });
    }

    const transactions = await queryBuilder.getMany();

    // تبدیل به DTO
    return transactions.map((transaction) => ({
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
    }));
  }

  async confirmWithdraw(txId: number): Promise<WithdrawWalletResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // پیدا کردن تراکنش
      const transaction = await queryRunner.manager.findOne(WalletTransaction, {
        where: { id: txId },
        relations: ['user'],
      });

      if (!transaction) {
        throw new NotFoundException('تراکنش یافت نشد');
      }

      // بررسی نوع و وضعیت تراکنش
      if (transaction.type !== TransactionType.WITHDRAW) {
        throw new BadRequestException('این تراکنش برداشت نیست');
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('تراکنش قابل تایید نیست');
      }

      // تایید تراکنش
      await queryRunner.manager.update(
        WalletTransaction,
        { id: txId },
        { status: TransactionStatus.CONFIRMED },
      );

      await queryRunner.commitTransaction();

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        status: TransactionStatus.CONFIRMED,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectWithdraw(txId: number): Promise<WithdrawWalletResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // پیدا کردن تراکنش
      const transaction = await queryRunner.manager.findOne(WalletTransaction, {
        where: { id: txId },
        relations: ['user'],
      });

      if (!transaction) {
        throw new NotFoundException('تراکنش یافت نشد');
      }

      // بررسی نوع و وضعیت تراکنش
      if (transaction.type !== TransactionType.WITHDRAW) {
        throw new BadRequestException('این تراکنش برداشت نیست');
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('تراکنش قابل رد نیست');
      }

      // رد تراکنش
      await queryRunner.manager.update(
        WalletTransaction,
        { id: txId },
        { status: TransactionStatus.FAILED },
      );

      // بازگشت مبلغ به کیف پول کاربر
      const withdrawAmount = Math.abs(transaction.amount); // مقدار مثبت برای اضافه کردن
      await queryRunner.manager.update(
        User,
        { id: transaction.userId },
        { walletBalance: () => `walletBalance + ${withdrawAmount}` },
      );

      await queryRunner.commitTransaction();

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        status: TransactionStatus.FAILED,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
