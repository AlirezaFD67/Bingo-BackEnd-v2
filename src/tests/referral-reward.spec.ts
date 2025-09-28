import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../modules/auth/auth.service';
import { User } from '../entities/user.entity';
import { OtpCode } from '../entities/otp-code.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { AppSettings } from '../entities/app-settings.entity';
import { SmsService } from '../modules/auth/sms.service';
import { JwtService } from '@nestjs/jwt';
import { TransactionType } from '../enums/transaction-type.enum';

describe('ReferralRewardSystem', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let walletTransactionRepository: Repository<WalletTransaction>;
  let appSettingsRepository: Repository<AppSettings>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockOtpCodeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockWalletTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAppSettingsRepository = {
    findOne: jest.fn(),
  };

  const mockSmsService = {
    sendOtp: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(OtpCode),
          useValue: mockOtpCodeRepository,
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockWalletTransactionRepository,
        },
        {
          provide: getRepositoryToken(AppSettings),
          useValue: mockAppSettingsRepository,
        },
        {
          provide: SmsService,
          useValue: mockSmsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    walletTransactionRepository = module.get<Repository<WalletTransaction>>(
      getRepositoryToken(WalletTransaction),
    );
    appSettingsRepository = module.get<Repository<AppSettings>>(
      getRepositoryToken(AppSettings),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('giveReferralReward', () => {
    it('should give referral reward to referrer when new user registers with valid referral code', async () => {
      // Arrange
      const referralCode = '123456';
      const newUserId = 2;
      const referrerId = 1;
      const rewardAmount = 10000;

      const referrerUser = {
        id: referrerId,
        walletBalance: 50000,
        referralCode,
      } as User;

      const referralRewardSetting = {
        key: 'referral_reward_amount',
        value: rewardAmount.toString(),
      } as AppSettings;

      mockUserRepository.findOne.mockResolvedValueOnce(referrerUser);
      mockAppSettingsRepository.findOne.mockResolvedValueOnce(
        referralRewardSetting,
      );
      mockUserRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockWalletTransactionRepository.create.mockReturnValueOnce({
        userId: referrerId,
        amount: rewardAmount,
        type: TransactionType.REFERRAL_BONUS,
        description: `پاداش معرفی کاربر جدید (ID: ${newUserId})`,
      });
      mockWalletTransactionRepository.save.mockResolvedValueOnce({});

      // Act
      await (authService as any).giveReferralReward(referralCode, newUserId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode },
      });
      expect(mockAppSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { key: 'referral_reward_amount' },
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(referrerId, {
        walletBalance: 60000, // 50000 + 10000
      });
      expect(mockWalletTransactionRepository.create).toHaveBeenCalledWith({
        userId: referrerId,
        amount: rewardAmount,
        type: TransactionType.REFERRAL_BONUS,
        description: `پاداش معرفی کاربر جدید (ID: ${newUserId})`,
      });
      expect(mockWalletTransactionRepository.save).toHaveBeenCalled();
    });

    it('should not give reward if referrer user not found', async () => {
      // Arrange
      const referralCode = '999999';
      const newUserId = 2;

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      // Act
      await (authService as any).giveReferralReward(referralCode, newUserId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode },
      });
      expect(mockAppSettingsRepository.findOne).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockWalletTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should not give reward if referral reward setting not found', async () => {
      // Arrange
      const referralCode = '123456';
      const newUserId = 2;
      const referrerId = 1;

      const referrerUser = {
        id: referrerId,
        walletBalance: 50000,
        referralCode,
      } as User;

      mockUserRepository.findOne.mockResolvedValueOnce(referrerUser);
      mockAppSettingsRepository.findOne.mockResolvedValueOnce(null);

      // Act
      await (authService as any).giveReferralReward(referralCode, newUserId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode },
      });
      expect(mockAppSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { key: 'referral_reward_amount' },
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockWalletTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should not give reward if reward amount is zero or negative', async () => {
      // Arrange
      const referralCode = '123456';
      const newUserId = 2;
      const referrerId = 1;

      const referrerUser = {
        id: referrerId,
        walletBalance: 50000,
        referralCode,
      } as User;

      const referralRewardSetting = {
        key: 'referral_reward_amount',
        value: '0',
      } as AppSettings;

      mockUserRepository.findOne.mockResolvedValueOnce(referrerUser);
      mockAppSettingsRepository.findOne.mockResolvedValueOnce(
        referralRewardSetting,
      );

      // Act
      await (authService as any).giveReferralReward(referralCode, newUserId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode },
      });
      expect(mockAppSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { key: 'referral_reward_amount' },
      });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockWalletTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully without stopping registration process', async () => {
      // Arrange
      const referralCode = '123456';
      const newUserId = 2;

      mockUserRepository.findOne.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        (authService as any).giveReferralReward(referralCode, newUserId),
      ).resolves.not.toThrow();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode },
      });
    });
  });

  describe('verifyOtp with referral reward', () => {
    it('should call giveReferralReward when new user registers with valid referral code', async () => {
      // Arrange
      const phoneNumber = '09123456789';
      const code = '1234';
      const incomingReferral = '123456';

      const referrerUser = {
        id: 1,
        walletBalance: 30000,
        referralCode: incomingReferral,
      } as User;

      const otpCode = {
        id: 1,
        phoneNumber,
        code,
        isVerified: false,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        incomingReferral,
      } as OtpCode;

      const newUser = {
        id: 2,
        phoneNumber,
        referredBy: incomingReferral,
        referralCode: '789012',
      } as User;

      // Mock for referral validation
      mockUserRepository.findOne
        .mockResolvedValueOnce(referrerUser) // for referral validation
        .mockResolvedValueOnce(null); // for existing user check

      mockOtpCodeRepository.findOne.mockResolvedValueOnce(otpCode);
      mockOtpCodeRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockUserRepository.create.mockReturnValueOnce(newUser);
      mockUserRepository.save.mockResolvedValueOnce(newUser);
      mockJwtService.sign.mockReturnValueOnce('mock-jwt-token');

      // Spy on giveReferralReward method
      const giveReferralRewardSpy = jest.spyOn(
        authService as any,
        'giveReferralReward',
      );

      // Act
      const result = await authService.verifyOtp({
        phoneNumber,
        code,
        incomingReferral,
      });

      // Assert
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        hasUsername: false,
      });

      // Verify giveReferralReward was called
      expect(giveReferralRewardSpy).toHaveBeenCalledWith(incomingReferral, 2);
    });

    it('should not give referral reward when existing user logs in', async () => {
      // Arrange
      const phoneNumber = '09123456789';
      const code = '1234';
      const incomingReferral = '123456';

      const existingUser = {
        id: 1,
        phoneNumber,
        walletBalance: 50000,
        referralCode: '789012',
      } as User;

      const otpCode = {
        id: 1,
        phoneNumber,
        code,
        isVerified: false,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        incomingReferral,
      } as OtpCode;

      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: 2, referralCode: incomingReferral }) // for referral validation
        .mockResolvedValueOnce(existingUser); // for existing user check

      mockOtpCodeRepository.findOne.mockResolvedValueOnce(otpCode);
      mockOtpCodeRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockJwtService.sign.mockReturnValueOnce('mock-jwt-token');

      // Act
      const result = await authService.verifyOtp({
        phoneNumber,
        code,
        incomingReferral,
      });

      // Assert
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        hasUsername: false,
      });

      // Verify no referral reward was given
      expect(mockAppSettingsRepository.findOne).not.toHaveBeenCalled();
      expect(mockWalletTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('should not give referral reward when no referral code provided', async () => {
      // Arrange
      const phoneNumber = '09123456789';
      const code = '1234';

      const otpCode = {
        id: 1,
        phoneNumber,
        code,
        isVerified: false,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        incomingReferral: null,
      } as OtpCode;

      const newUser = {
        id: 1,
        phoneNumber,
        referredBy: null,
        referralCode: '789012',
      } as User;

      mockUserRepository.findOne.mockResolvedValueOnce(null); // for existing user check
      mockOtpCodeRepository.findOne.mockResolvedValueOnce(otpCode);
      mockOtpCodeRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockUserRepository.create.mockReturnValueOnce(newUser);
      mockUserRepository.save.mockResolvedValueOnce(newUser);
      mockJwtService.sign.mockReturnValueOnce('mock-jwt-token');

      // Act
      const result = await authService.verifyOtp({
        phoneNumber,
        code,
      });

      // Assert
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        hasUsername: false,
      });

      // Verify no referral reward was given
      expect(mockAppSettingsRepository.findOne).not.toHaveBeenCalled();
      expect(mockWalletTransactionRepository.create).not.toHaveBeenCalled();
    });
  });
});
