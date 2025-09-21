import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { TransactionType } from '../../enums/transaction-type.enum';
import { GetWalletTransactionsQueryDto } from './dto/get-wallet-transactions-query.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  async getTransactions(query: GetWalletTransactionsQueryDto): Promise<WalletTransaction[]> {
    const queryBuilder = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .orderBy('transaction.createdAt', 'DESC');

    if (query.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: query.type });
    }

    return queryBuilder.getMany();
  }
}
