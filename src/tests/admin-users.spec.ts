import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../modules/users/users.service';
import { User } from '../entities/user.entity';
import { Reservation } from '../entities/reservation.entity';
import { UserRole } from '../entities/user.entity';

describe('AdminUsers', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let reservationRepository: Repository<Reservation>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockReservationRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    reservationRepository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('باید کاربر را با ID پیدا کند و در فرمت صحیح برگرداند', async () => {
      const mockUser = {
        id: 1,
        username: 'john_doe',
        firstName: 'علی',
        lastName: 'احمدی',
        phoneNumber: '09123456789',
        bankCardNumber: '1234 5678 9012 3456',
        shebaNumber: 'IR123456789012345678901234',
        referralCode: '12345',
        referredBy: '67890',
        role: UserRole.USER,
        createdAt: new Date('2024-06-20T12:34:56.789Z'),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.getUserById(1);

      expect(result).toEqual({
        id: 1,
        username: 'john_doe',
        firstName: 'علی',
        lastName: 'احمدی',
        phoneNumber: '09123456789',
        bankCardNumber: '1234 5678 9012 3456', // transform در service اعمال نمی‌شود
        shebaNumber: 'IR123456789012345678901234',
        referralCode: '12345',
        referredBy: '67890',
        role: UserRole.USER,
        createdAt: new Date('2024-06-20T12:34:56.789Z'),
        createdAtPersian: '1403/03/20', // تبدیل تقریبی شمسی
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('باید خطای ۴۰۴ برگرداند وقتی کاربر یافت نشد', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(usersService.getUserById(999)).rejects.toThrow(
        'کاربر یافت نشد',
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('باید کاربر با اطلاعات ناقص را مدیریت کند', async () => {
      const mockUser = {
        id: 2,
        username: null,
        firstName: null,
        lastName: null,
        phoneNumber: '09129876543',
        bankCardNumber: null,
        shebaNumber: null,
        referralCode: null,
        referredBy: null,
        role: UserRole.USER,
        createdAt: new Date('2024-07-15T10:20:30.000Z'),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.getUserById(2);

      expect(result).toEqual({
        id: 2,
        username: null,
        firstName: null,
        lastName: null,
        phoneNumber: '09129876543',
        bankCardNumber: null,
        shebaNumber: null,
        referralCode: null,
        referredBy: null,
        role: UserRole.USER,
        createdAt: new Date('2024-07-15T10:20:30.000Z'),
        createdAtPersian: '1403/04/15',
      });
    });
  });

  describe('getAllUsers', () => {
    it('باید لیست کاربران را با فیلدهای رفرال برگرداند', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'john_doe',
          firstName: 'علی',
          lastName: 'احمدی',
          phoneNumber: '09123456789',
          bankCardNumber: '1234 5678 9012 3456',
          shebaNumber: 'IR123456789012345678901234',
          referralCode: '12345',
          referredBy: '67890',
          role: UserRole.USER,
          createdAt: new Date('2024-06-20T12:34:56.789Z'),
          updatedAt: new Date(),
        },
        {
          id: 2,
          username: 'jane_doe',
          firstName: 'مریم',
          lastName: 'رضایی',
          phoneNumber: '09129876543',
          bankCardNumber: null,
          shebaNumber: null,
          referralCode: '54321',
          referredBy: null,
          role: UserRole.USER,
          createdAt: new Date('2024-07-15T10:20:30.000Z'),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await usersService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        username: 'john_doe',
        firstName: 'علی',
        lastName: 'احمدی',
        phoneNumber: '09123456789',
        bankCardNumber: '1234 5678 9012 3456',
        shebaNumber: 'IR123456789012345678901234',
        referralCode: '12345',
        referredBy: '67890',
        role: UserRole.USER,
        createdAt: new Date('2024-06-20T12:34:56.789Z'),
        createdAtPersian: '1403/03/20',
      });
      expect(result[1]).toEqual({
        id: 2,
        username: 'jane_doe',
        firstName: 'مریم',
        lastName: 'رضایی',
        phoneNumber: '09129876543',
        bankCardNumber: null,
        shebaNumber: null,
        referralCode: '54321',
        referredBy: null,
        role: UserRole.USER,
        createdAt: new Date('2024-07-15T10:20:30.000Z'),
        createdAtPersian: '1403/04/15',
      });
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('باید لیست خالی برگرداند وقتی هیچ کاربری وجود ندارد', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await usersService.getAllUsers();

      expect(result).toEqual([]);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('باید کاربر ادمین را در لیست شامل شود', async () => {
      const mockUsers = [
        {
          id: 3,
          username: 'admin',
          firstName: 'ادمین',
          lastName: 'سیستم',
          phoneNumber: '09121111111',
          bankCardNumber: null,
          shebaNumber: null,
          referralCode: null,
          referredBy: null,
          role: UserRole.ADMIN,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await usersService.getAllUsers();

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe(UserRole.ADMIN);
      expect(result[0].referralCode).toBeNull();
      expect(result[0].referredBy).toBeNull();
    });
  });
});
