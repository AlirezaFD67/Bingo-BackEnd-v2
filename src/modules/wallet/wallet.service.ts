import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../../enums/transaction-type.enum';
import { ChargeWalletDto } from './dto/charge-wallet.dto';
import { ChargeWalletResponseDto } from './dto/charge-wallet-response.dto';
import { WithdrawWalletDto } from './dto/withdraw-wallet.dto';
import { WithdrawWalletResponseDto } from './dto/withdraw-wallet-response.dto';
import { GetWalletTransactionsDto } from './dto/get-wallet-transactions.dto';
import { WalletTransactionResponseDto } from './dto/wallet-transaction-response.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async chargeWallet(
    userId: number,
    chargeDto: ChargeWalletDto,
  ): Promise<ChargeWalletResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // بررسی وجود کاربر
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('کاربر یافت نشد');
      }

      // ایجاد تراکنش شارژ
      const transaction = queryRunner.manager.create(WalletTransaction, {
        userId,
        amount: chargeDto.amount,
        type: TransactionType.CHARGE,
        status: TransactionStatus.CONFIRMED,
        description: 'شارژ کیف پول',
      });

      const savedTransaction = await queryRunner.manager.save(
        WalletTransaction,
        transaction,
      );

      // به‌روزرسانی موجودی کاربر
      await queryRunner.manager.update(
        User,
        { id: userId },
        { walletBalance: () => `walletBalance + ${chargeDto.amount}` },
      );

      await queryRunner.commitTransaction();

      return {
        id: savedTransaction.id,
        userId: savedTransaction.userId,
        amount: savedTransaction.amount,
        type: savedTransaction.type,
        status: savedTransaction.status,
        createdAt: savedTransaction.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdrawWallet(
    userId: number,
    withdrawDto: WithdrawWalletDto,
  ): Promise<WithdrawWalletResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // بررسی وجود کاربر
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('کاربر یافت نشد');
      }

      // بررسی موجودی کافی
      if (user.walletBalance < withdrawDto.amount) {
        throw new BadRequestException('موجودی کیف پول کافی نیست');
      }

      // ایجاد تراکنش برداشت با وضعیت pending
      const transaction = queryRunner.manager.create(WalletTransaction, {
        userId,
        amount: -withdrawDto.amount, // مبلغ منفی برای برداشت
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
        description: 'درخواست برداشت از کیف پول',
      });

      const savedTransaction = await queryRunner.manager.save(
        WalletTransaction,
        transaction,
      );

      // کم کردن مبلغ از موجودی کاربر
      await queryRunner.manager.update(
        User,
        { id: userId },
        { walletBalance: () => `walletBalance - ${withdrawDto.amount}` },
      );

      await queryRunner.commitTransaction();

      return {
        id: savedTransaction.id,
        userId: savedTransaction.userId,
        amount: savedTransaction.amount,
        type: savedTransaction.type,
        status: savedTransaction.status,
        createdAt: savedTransaction.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWalletTransactions(
    userId: number,
    filters: GetWalletTransactionsDto,
  ): Promise<WalletTransactionResponseDto[]> {
    // بررسی وجود کاربر
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // ساخت query builder
    const queryBuilder = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC');

    // اعمال فیلتر نوع تراکنش
    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    // اعمال فیلتر وضعیت تراکنش
    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: filters.status,
      });
    }

    // اعمال فیلتر روزهای گذشته
    if (filters.days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - filters.days);
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate,
      });
    }

    // اجرای کوئری
    const transactions = await queryBuilder.getMany();

    // تبدیل به DTO
    return transactions.map((transaction) => ({
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt,
      description: transaction.description,
    }));
  }
}
