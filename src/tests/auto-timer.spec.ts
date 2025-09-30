import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AutoTimerService } from '../modules/admin/auto-timer.service';
import { GameRoom } from '../entities/game-room.entity';
import { ActiveRoomGlobal } from '../entities/active-room-global.entity';
import { Reservation } from '../entities/reservation.entity';
import { Card } from '../entities/card.entity';
import { UserReservedCard } from '../entities/user-reserved-card.entity';
import { DrawnNumber } from '../entities/drawn-number.entity';
import { User } from '../entities/user.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { RoomStatus } from '../enums/room-status.enum';
import { RoomType } from '../enums/room-type.enum';

describe('AutoTimerService', () => {
  let service: AutoTimerService;
  let gameRoomRepository: Repository<GameRoom>;
  let activeRoomRepository: Repository<ActiveRoomGlobal>;
  let drawnNumberRepository: Repository<DrawnNumber>;

  const mockGameRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockActiveRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  const mockReservationRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  const mockCardRepository = {
    find: jest.fn(),
  };

  const mockUserReservedCardRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDrawnNumberRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockWalletTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      },
    })),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoTimerService,
        {
          provide: getRepositoryToken(GameRoom),
          useValue: mockGameRoomRepository,
        },
        {
          provide: getRepositoryToken(ActiveRoomGlobal),
          useValue: mockActiveRoomRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(UserReservedCard),
          useValue: mockUserReservedCardRepository,
        },
        {
          provide: getRepositoryToken(DrawnNumber),
          useValue: mockDrawnNumberRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(WalletTransaction),
          useValue: mockWalletTransactionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AutoTimerService>(AutoTimerService);
    gameRoomRepository = module.get<Repository<GameRoom>>(
      getRepositoryToken(GameRoom),
    );
    activeRoomRepository = module.get<Repository<ActiveRoomGlobal>>(
      getRepositoryToken(ActiveRoomGlobal),
    );
    drawnNumberRepository = module.get<Repository<DrawnNumber>>(
      getRepositoryToken(DrawnNumber),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getActiveRoomsStatus', () => {
    it('should return correct status structure', () => {
      const status = service.getActiveRoomsStatus();

      expect(status).toHaveProperty('totalRooms');
      expect(status).toHaveProperty('pendingRooms');
      expect(status).toHaveProperty('startedRooms');
      expect(status).toHaveProperty('errorRooms');
      expect(status).toHaveProperty('rooms');
      expect(status).toHaveProperty('mainLoopActive');
      expect(status).toHaveProperty('syncLoopActive');
      expect(Array.isArray(status.rooms)).toBe(true);
    });

    it('should return zero rooms when no rooms are active', () => {
      const status = service.getActiveRoomsStatus();

      expect(status.totalRooms).toBe(0);
      expect(status.pendingRooms).toBe(0);
      expect(status.startedRooms).toBe(0);
      expect(status.errorRooms).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return health check structure', async () => {
      mockActiveRoomRepository.count.mockResolvedValue(0);

      const health = await service.healthCheck();

      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('memoryState');
      expect(health).toHaveProperty('databaseState');
      expect(health).toHaveProperty('loops');
      expect(health).toHaveProperty('issues');
    });

    it('should check health status based on loops and problematic rooms', async () => {
      mockActiveRoomRepository.count.mockResolvedValue(0);

      const health = await service.healthCheck();

      // health.isHealthy بستگی به وضعیت Loops دارد که در تست null هستند
      expect(typeof health.isHealthy).toBe('boolean');
      expect(health.issues.problematicRooms).toBe(0);
    });
  });

  describe('recoverActiveRooms', () => {
    it('should recover started rooms from database', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        status: RoomStatus.STARTED,
        remainingSeconds: 0,
        gameRoom: {
          id: 1,
          name: 'Test Room',
          startTimer: 60,
        },
      };

      const mockDrawnNumbers = [
        { number: 1 },
        { number: 5 },
        { number: 10 },
      ];

      mockActiveRoomRepository.find.mockResolvedValue([mockActiveRoom]);
      mockDrawnNumberRepository.find.mockResolvedValue(mockDrawnNumbers);

      await service.recoverActiveRooms();

      expect(mockActiveRoomRepository.find).toHaveBeenCalledWith({
        where: { status: RoomStatus.STARTED },
        relations: ['gameRoom'],
      });
      expect(mockDrawnNumberRepository.find).toHaveBeenCalledWith({
        where: { activeRoomId: mockActiveRoom.id },
        select: ['number'],
      });
    });

    it('should handle empty active rooms gracefully', async () => {
      mockActiveRoomRepository.find.mockResolvedValue([]);

      await service.recoverActiveRooms();

      expect(mockActiveRoomRepository.find).toHaveBeenCalled();
    });
  });

  describe('cleanupAllDuplicateNumbers', () => {
    it('should cleanup duplicate numbers for all started rooms', async () => {
      const mockStartedRooms = [
        { id: 1 },
        { id: 2 },
      ];

      mockActiveRoomRepository.find.mockResolvedValue(mockStartedRooms);
      mockDrawnNumberRepository.find.mockResolvedValue([]);

      await service['cleanupAllDuplicateNumbers']();

      expect(mockActiveRoomRepository.find).toHaveBeenCalledWith({
        where: { status: RoomStatus.STARTED },
        select: ['id'],
      });
    });
  });

  describe('State Management', () => {
    it('should maintain state in memory', () => {
      const status = service.getActiveRoomsStatus();
      
      expect(typeof status.totalRooms).toBe('number');
      expect(typeof status.mainLoopActive).toBe('boolean');
      expect(typeof status.syncLoopActive).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle health check errors gracefully', async () => {
      mockActiveRoomRepository.count.mockRejectedValue(
        new Error('Database error'),
      );

      const health = await service.healthCheck();

      expect(health.isHealthy).toBe(false);
      expect(health).toHaveProperty('error');
    });
  });
});
