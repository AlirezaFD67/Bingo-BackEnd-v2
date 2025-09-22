import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { TransactionType, TransactionStatus } from '../../enums/transaction-type.enum';
import { ChargeWalletDto } from './dto/charge-wallet.dto';
import { ChargeWalletResponseDto } from './dto/charge-wallet-response.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async chargeWallet(userId: number, chargeDto: ChargeWalletDto): Promise<ChargeWalletResponseDto> {
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

      const savedTransaction = await queryRunner.manager.save(WalletTransaction, transaction);

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
}
