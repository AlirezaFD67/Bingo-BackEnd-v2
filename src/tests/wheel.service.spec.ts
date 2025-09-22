import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WheelService } from '../modules/wheel/wheel.service';
import { User } from '../entities/user.entity';
import { WheelSpin } from '../entities/wheel-spin.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';

describe('WheelService', () => {
  let service: WheelService;
  let userRepository: Repository<User>;
  let wheelSpinRepository: Repository<WheelSpin>;
  let walletTransactionRepository: Repository<WalletTransaction>;

  const mockUser = {
    id: 1,
    phoneNumber: '09112223332',
    walletBalance: 100000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WheelService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WheelSpin),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WheelService>(WheelService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    wheelSpinRepository = module.get<Repository<WheelSpin>>(getRepositoryToken(WheelSpin));
    walletTransactionRepository = module.get<Repository<WalletTransaction>>(getRepositoryToken(WalletTransaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canSpin', () => {
    it('باید برای کاربر جدید true برگرداند', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue(null);

      const result = await service.canSpin(1);

      expect(result).toEqual({
        canSpin: true,
      });
    });

    it('باید برای کاربری که 24 ساعت گذشته چرخیده true برگرداند', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 25); // 25 ساعت قبل

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue({
        id: 1,
        userId: 1,
        prizeAmount: 20000,
        lastSpinAt: pastDate,
      } as WheelSpin);

      const result = await service.canSpin(1);

      expect(result).toEqual({
        canSpin: true,
      });
    });

    it('باید برای کاربری که کمتر از 24 ساعت چرخیده false و زمان باقی‌مانده برگرداند', async () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 2); // 2 ساعت قبل

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue({
        id: 1,
        userId: 1,
        prizeAmount: 20000,
        lastSpinAt: recentDate,
      } as WheelSpin);

      const result = await service.canSpin(1);

      expect(result.canSpin).toBe(false);
      expect(result.remainingTime).toBeDefined();
      expect(result.remainingTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('باید اگر کاربر وجود نداشت NotFoundException بدهد', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.canSpin(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('spinWheel', () => {
    it('باید چرخش با جایزه مثبت را با موفقیت انجام دهد', async () => {
      const spinDto = { value: 20000 };
      const mockWheelSpin = {
        id: 1,
        userId: 1,
        prizeAmount: 20000,
        lastSpinAt: new Date(),
      };
      const mockTransaction = {
        id: 1,
        userId: 1,
        amount: 20000,
        type: TransactionType.WHEEL_SPIN,
        description: 'جایزه گردونه',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(wheelSpinRepository, 'create').mockReturnValue(mockWheelSpin as WheelSpin);
      jest.spyOn(wheelSpinRepository, 'save').mockResolvedValue(mockWheelSpin as WheelSpin);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(walletTransactionRepository, 'create').mockReturnValue(mockTransaction as WalletTransaction);
      jest.spyOn(walletTransactionRepository, 'save').mockResolvedValue(mockTransaction as WalletTransaction);

      const result = await service.spinWheel(1, spinDto);

      expect(result).toEqual({
        success: true,
        prizeAmount: 20000,
        newBalance: 120000, // 100000 + 20000
        message: 'جایزه گردونه با موفقیت ثبت شد',
      });

      expect(userRepository.update).toHaveBeenCalledWith(1, {
        walletBalance: 120000,
      });
      expect(walletTransactionRepository.save).toHaveBeenCalled();
    });

    it('باید چرخش بدون جایزه را با موفقیت انجام دهد', async () => {
      const spinDto = { value: 0 };
      const mockWheelSpin = {
        id: 1,
        userId: 1,
        prizeAmount: 0,
        lastSpinAt: new Date(),
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(wheelSpinRepository, 'create').mockReturnValue(mockWheelSpin as WheelSpin);
      jest.spyOn(wheelSpinRepository, 'save').mockResolvedValue(mockWheelSpin as WheelSpin);

      const result = await service.spinWheel(1, spinDto);

      expect(result).toEqual({
        success: true,
        prizeAmount: 0,
        newBalance: 100000, // بدون تغییر
        message: 'چرخش گردونه ثبت شد',
      });

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(walletTransactionRepository.save).not.toHaveBeenCalled();
    });

    it('باید برای مقادیر نامعتبر BadRequestException بدهد', async () => {
      const invalidSpinDto = { value: 15000 };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue(null);

      await expect(service.spinWheel(1, invalidSpinDto)).rejects.toThrow(
        new BadRequestException('مقدار جایزه نامعتبر است')
      );
    });

    it('باید برای محدودیت 24 ساعته BadRequestException بدهد', async () => {
      const spinDto = { value: 20000 };
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 2); // 2 ساعت قبل

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue({
        id: 1,
        userId: 1,
        prizeAmount: 20000,
        lastSpinAt: recentDate,
      } as WheelSpin);

      await expect(service.spinWheel(1, spinDto)).rejects.toThrow(
        new BadRequestException('شما فقط یکبار در 24 ساعت می‌توانید گردونه بچرخانید')
      );
    });

    it('باید اگر کاربر وجود نداشت NotFoundException بدهد', async () => {
      const spinDto = { value: 20000 };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.spinWheel(999, spinDto)).rejects.toThrow(NotFoundException);
    });

    it('باید مقادیر مجاز را قبول کند', async () => {
      const validAmounts = [20000, 10000, 5000, 0];
      
      for (const amount of validAmounts) {
        const spinDto = { value: amount };
        const mockWheelSpin = {
          id: 1,
          userId: 1,
          prizeAmount: amount,
          lastSpinAt: new Date(),
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
        jest.spyOn(wheelSpinRepository, 'findOne').mockResolvedValue(null);
        jest.spyOn(wheelSpinRepository, 'create').mockReturnValue(mockWheelSpin as WheelSpin);
        jest.spyOn(wheelSpinRepository, 'save').mockResolvedValue(mockWheelSpin as WheelSpin);

        if (amount > 0) {
          jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
          jest.spyOn(walletTransactionRepository, 'create').mockReturnValue({
            id: 1,
            userId: 1,
            amount,
            type: TransactionType.WHEEL_SPIN,
            description: 'جایزه گردونه',
          } as WalletTransaction);
          jest.spyOn(walletTransactionRepository, 'save').mockResolvedValue({
            id: 1,
            userId: 1,
            amount,
            type: TransactionType.WHEEL_SPIN,
            description: 'جایزه گردونه',
          } as WalletTransaction);
        }

        const result = await service.spinWheel(1, spinDto);

        expect(result.prizeAmount).toBe(amount);
        expect(result.success).toBe(true);
      }
    });
  });
});
