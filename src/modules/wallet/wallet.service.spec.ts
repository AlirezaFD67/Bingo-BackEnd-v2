import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from '../modules/wallet/wallet.service';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { User } from '../entities/user.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../enums/transaction-type.enum';
import { GetWalletTransactionsDto } from '../modules/wallet/dto/get-wallet-transactions.dto';
import { WalletTransactionResponseDto } from '../modules/wallet/dto/wallet-transaction-response.dto';

describe('WalletService', () => {
  let service: WalletService;
  let walletTransactionRepository: Repository<WalletTransaction>;
  let userRepository: Repository<User>;

  const mockWalletTransactionRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
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

  describe('getWalletTransactions', () => {
    const mockUser = {
      id: 123,
      username: 'testuser',
      walletBalance: 100000,
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
    });

    it('should return user transactions with pagination', async () => {
      const mockTransactions = [
        {
          id: 1,
          userId: 123,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 123,
          amount: 5000,
          type: TransactionType.CARD_PURCHASE,
          status: TransactionStatus.CONFIRMED,
          description: 'Card purchase',
          createdAt: new Date(),
        },
      ];

      const expectedResult: WalletTransactionResponseDto[] = [
        {
          id: 1,
          userId: 123,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: mockTransactions[0].createdAt,
        },
        {
          id: 2,
          userId: 123,
          amount: 5000,
          type: TransactionType.CARD_PURCHASE,
          status: TransactionStatus.CONFIRMED,
          description: 'Card purchase',
          createdAt: mockTransactions[1].createdAt,
        },
      ];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const filters: GetWalletTransactionsDto = {
        page: 1,
        limit: 20,
      };

      const result = await service.getWalletTransactions(123, filters);

      expect(result).toEqual(expectedResult);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 123 },
      });
      expect(queryBuilder.where).toHaveBeenCalledWith('transaction.userId = :userId', { userId: 123 });
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('transaction.createdAt', 'DESC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should apply type filter', async () => {
      const mockTransactions = [
        {
          id: 1,
          userId: 123,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: new Date(),
        },
      ];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const filters: GetWalletTransactionsDto = {
        type: TransactionType.CHARGE,
      };

      await service.getWalletTransactions(123, filters);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.type = :type',
        { type: TransactionType.CHARGE },
      );
    });

    it('should apply status filter', async () => {
      const mockTransactions = [
        {
          id: 1,
          userId: 123,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: new Date(),
        },
      ];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const filters: GetWalletTransactionsDto = {
        status: TransactionStatus.CONFIRMED,
      };

      await service.getWalletTransactions(123, filters);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.status = :status',
        { status: TransactionStatus.CONFIRMED },
      );
    });

    it('should apply days filter', async () => {
      const mockTransactions = [
        {
          id: 1,
          userId: 123,
          amount: 10000,
          type: TransactionType.CHARGE,
          status: TransactionStatus.CONFIRMED,
          description: 'Test charge',
          createdAt: new Date(),
        },
      ];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const filters: GetWalletTransactionsDto = {
        days: 7,
      };

      await service.getWalletTransactions(123, filters);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.createdAt >= :startDate',
        expect.objectContaining({
          startDate: expect.any(Date),
        }),
      );
    });

    it('should use default pagination values', async () => {
      const mockTransactions: any[] = [];

      const queryBuilder = mockWalletTransactionRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mockTransactions);

      const filters: GetWalletTransactionsDto = {};

      await service.getWalletTransactions(123, filters);

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const filters: GetWalletTransactionsDto = {};

      await expect(service.getWalletTransactions(999, filters)).rejects.toThrow(
        'کاربر یافت نشد',
      );
    });
  });
});
