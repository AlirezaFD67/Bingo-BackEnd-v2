import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from '../modules/admin/wallet.service';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { User } from '../entities/user.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../enums/transaction-type.enum';
import { GetWalletTransactionsQueryDto } from '../modules/admin/dto/get-wallet-transactions-query.dto';
import { AdminWalletTransactionResponseDto } from '../modules/admin/dto/wallet-transaction-response.dto';

describe('AdminWalletService', () => {
  let service: WalletService;
  let walletTransactionRepository: Repository<WalletTransaction>;
  let userRepository: Repository<User>;

  const mockWalletTransactionRepository = {
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockWalletTransactionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletTransactionRepository = module.get<Repository<WalletTransaction>>(
      getRepositoryToken(WalletTransaction),
    );
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransactions', () => {
    it('should return all transactions when no filter is applied', async () => {
      const mockTransactions = [
        {
          id: 1,
          userId: 1,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: new Date(),
        },
      ];

      const expectedResult: AdminWalletTransactionResponseDto[] = [
        {
          id: 1,
          userId: 1,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: mockTransactions[0].createdAt,
        },
      ];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const query: GetWalletTransactionsQueryDto = {};
      const result = await service.getTransactions(query);

      expect(result).toEqual(expectedResult);
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'transaction.user',
        'user',
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'transaction.createdAt',
        'DESC',
      );
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should filter transactions by type when type is provided', async () => {
      const mockTransactions = [
        {
          id: 1,
          userId: 1,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: new Date(),
        },
      ];

      const expectedResult: AdminWalletTransactionResponseDto[] = [
        {
          id: 1,
          userId: 1,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: mockTransactions[0].createdAt,
        },
      ];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const query: GetWalletTransactionsQueryDto = {
        type: TransactionType.CHARGE,
      };
      const result = await service.getTransactions(query);

      expect(result).toEqual(expectedResult);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.type = :type',
        {
          type: TransactionType.CHARGE,
        },
      );
    });

    it('should return empty array when no transactions found', async () => {
      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([]);

      const query: GetWalletTransactionsQueryDto = {};
      const result = await service.getTransactions(query);

      expect(result).toEqual([]);
    });
  });
});
