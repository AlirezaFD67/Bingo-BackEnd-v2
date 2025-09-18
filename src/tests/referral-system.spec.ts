import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../modules/auth/auth.service';
import { User } from '../entities/user.entity';
import { OtpCode } from '../entities/otp-code.entity';
import { SmsService } from '../modules/auth/sms.service';
import { JwtService } from '@nestjs/jwt';

describe('ReferralSystem', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let otpCodeRepository: Repository<OtpCode>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOtpCodeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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
    otpCodeRepository = module.get<Repository<OtpCode>>(
      getRepositoryToken(OtpCode),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUniqueReferralCode', () => {
    it('باید کد رفرال ۶ رقمی منحصر به فرد تولید کند', async () => {
      // Mock بررسی منحصر به فرد بودن
      mockUserRepository.findOne.mockResolvedValue(null);

      const referralCode = await (
        authService as any
      ).generateUniqueReferralCode();

      expect(referralCode).toMatch(/^\d{6}$/);
      expect(parseInt(referralCode)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(referralCode)).toBeLessThanOrEqual(999999);
    });

    it('باید در صورت تکراری بودن کد، کد جدید تولید کند', async () => {
      // Mock کد تکراری
      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: 1 }) // کد اول تکراری
        .mockResolvedValueOnce(null); // کد دوم منحصر به فرد

      const referralCode = await (
        authService as any
      ).generateUniqueReferralCode();

      expect(referralCode).toMatch(/^\d{6}$/);
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('requestOtp - اعتبارسنجی کد رفرال', () => {
    it('باید کد رفرال معتبر را بپذیرد', async () => {
      const dto = {
        phoneNumber: '09123456789',
        incomingReferral: '123456',
      };

      // Mock کاربر موجود با کد رفرال
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        referralCode: '123456',
      });
      mockOtpCodeRepository.create.mockReturnValue({});
      mockOtpCodeRepository.save.mockResolvedValue({});

      const result = await authService.requestOtp(dto);

      expect(result.canUseReferral).toBe(false);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { referralCode: '123456' },
      });
    });

    it('باید کد رفرال نامعتبر را رد کند', async () => {
      const dto = {
        phoneNumber: '09123456789',
        incomingReferral: '999999',
      };

      // Mock عدم وجود کد رفرال
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.requestOtp(dto)).rejects.toThrow(
        'Invalid referral code',
      );
    });
  });

  describe('verifyOtp - ایجاد کاربر جدید با کد رفرال', () => {
    it('باید کاربر جدید با کد رفرال ایجاد کند', async () => {
      const dto = {
        phoneNumber: '09123456789',
        code: '1234',
        incomingReferral: '123456',
      };

      // Mock عدم وجود کاربر
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // بررسی شماره تلفن
        .mockResolvedValueOnce({ id: 1, referralCode: '123456' }); // اعتبارسنجی کد رفرال

      // Mock OTP معتبر
      mockOtpCodeRepository.findOne.mockResolvedValue({
        id: 1,
        phoneNumber: '09123456789',
        code: '1234',
        isVerified: false,
        expiresAt: new Date(Date.now() + 10000),
      });

      mockOtpCodeRepository.update.mockResolvedValue({});
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockResolvedValue({
        id: 10,
        phoneNumber: '09123456789',
        referralCode: '654321',
        referredBy: '123456',
      });

      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await authService.verifyOtp(dto);

      expect(result.accessToken).toBe('jwt_token');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        phoneNumber: '09123456789',
        referredBy: '123456',
        referralCode: expect.any(String),
      });
    });

    it('باید کاربر موجود را تغییر ندهد', async () => {
      const dto = {
        phoneNumber: '09123456789',
        code: '1234',
        incomingReferral: '123456',
      };

      // Mock وجود کاربر
      mockUserRepository.findOne
        .mockResolvedValueOnce({
          id: 10,
          phoneNumber: '09123456789',
          referredBy: null,
        }) // بررسی شماره تلفن
        .mockResolvedValueOnce({ id: 1, referralCode: '123456' }); // اعتبارسنجی کد رفرال

      // Mock OTP معتبر
      mockOtpCodeRepository.findOne.mockResolvedValue({
        id: 1,
        phoneNumber: '09123456789',
        code: '1234',
        isVerified: false,
        expiresAt: new Date(Date.now() + 10000),
      });

      mockOtpCodeRepository.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await authService.verifyOtp(dto);

      expect(result.accessToken).toBe('jwt_token');
      // مطمئن شو که create و save برای کاربر موجود فراخوانی نشده
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('باید کد رفرال خالی را مدیریت کند', async () => {
      const dto = {
        phoneNumber: '09123456789',
        code: '1234',
        incomingReferral: '', // خالی
      };

      // Mock عدم وجود کاربر
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // بررسی شماره تلفن
        .mockResolvedValueOnce(null); // بررسی کد رفرال (نادیده گرفته می‌شود)

      // Mock OTP معتبر
      mockOtpCodeRepository.findOne.mockResolvedValue({
        id: 1,
        phoneNumber: '09123456789',
        code: '1234',
        isVerified: false,
        expiresAt: new Date(Date.now() + 10000),
        incomingReferral: null,
      });

      mockOtpCodeRepository.update.mockResolvedValue({});
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockResolvedValue({
        id: 10,
        phoneNumber: '09123456789',
        referralCode: '654321',
        referredBy: undefined,
      });

      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await authService.verifyOtp(dto);

      expect(result.accessToken).toBe('jwt_token');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        phoneNumber: '09123456789',
        referredBy: undefined,
        referralCode: expect.any(String),
      });
    });
  });

  describe('verifyOtp - خطاها', () => {
    it('باید کد رفرال نامعتبر را رد کند', async () => {
      const dto = {
        phoneNumber: '09123456789',
        code: '1234',
        incomingReferral: '999999',
      };

      // Mock عدم وجود کد رفرال
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // بررسی شماره تلفن
        .mockResolvedValueOnce(null); // کد رفرال نامعتبر

      await expect(authService.verifyOtp(dto)).rejects.toThrow(
        'Invalid referral code',
      );
    });

    it('باید OTP نامعتبر را رد کند', async () => {
      const dto = {
        phoneNumber: '09123456789',
        code: '9999',
      };

      // Mock عدم وجود OTP
      mockOtpCodeRepository.findOne.mockResolvedValue(null);

      await expect(authService.verifyOtp(dto)).rejects.toThrow(
        'Invalid OTP code',
      );
    });

    it('باید OTP منقضی شده را رد کند', async () => {
      const dto = {
        phoneNumber: '09123456789',
        code: '1234',
      };

      // Mock OTP منقضی
      mockOtpCodeRepository.findOne.mockResolvedValue({
        id: 1,
        phoneNumber: '09123456789',
        code: '1234',
        isVerified: false,
        expiresAt: new Date(Date.now() - 10000), // گذشته
      });

      await expect(authService.verifyOtp(dto)).rejects.toThrow(
        'OTP code has expired',
      );
    });
  });
});





