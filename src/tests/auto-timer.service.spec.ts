import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutoTimerService } from '../modules/admin/auto-timer.service';
import { GameRoom } from '../entities/game-room.entity';
import { ActiveRoomGlobal } from '../entities/active-room-global.entity';
import { Reservation } from '../entities/reservation.entity';
import { RoomType } from '../enums/room-type.enum';
import { RoomStatus } from '../enums/room-status.enum';

describe('AutoTimerService', () => {
  let service: AutoTimerService;
  let gameRoomRepository: Repository<GameRoom>;
  let activeRoomRepository: Repository<ActiveRoomGlobal>;
  let reservationRepository: Repository<Reservation>;

  const mockGameRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockActiveRoomRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockReservationRepository = {
    createQueryBuilder: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AutoTimerService>(AutoTimerService);
    gameRoomRepository = module.get<Repository<GameRoom>>(getRepositoryToken(GameRoom));
    activeRoomRepository = module.get<Repository<ActiveRoomGlobal>>(getRepositoryToken(ActiveRoomGlobal));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize active rooms on module init', async () => {
      const mockActiveRooms = [
        {
          id: 1,
          entryFee: 1000,
          startTimer: 30,
          isActive: true,
          type: RoomType.GLOBAL,
          minPlayers: 2,
          createdAt: new Date(),
        },
      ];

      mockGameRoomRepository.find.mockResolvedValue(mockActiveRooms);
      mockActiveRoomRepository.findOne.mockResolvedValue(null);
      mockActiveRoomRepository.create.mockReturnValue({
        gameRoomId: 1,
        startTime: 30,
        status: RoomStatus.PENDING,
      });
      mockActiveRoomRepository.save.mockResolvedValue({
        id: 1,
        gameRoomId: 1,
        startTime: 30,
        status: RoomStatus.PENDING,
      });

      // Mock the private methods
      const initializeActiveRoomsSpy = jest.spyOn(service as any, 'initializeActiveRooms').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(initializeActiveRoomsSpy).toHaveBeenCalled();
    });
  });

  describe('createActiveRoom', () => {
    it('should create new active room if none exists', async () => {
      const mockGameRoom = {
        id: 1,
        entryFee: 1000,
        startTimer: 30,
        isActive: true,
        type: RoomType.GLOBAL,
        minPlayers: 2,
      };

      mockActiveRoomRepository.findOne.mockResolvedValue(null);
      mockActiveRoomRepository.create.mockReturnValue({
        gameRoomId: 1,
        startTime: 30,
        status: RoomStatus.PENDING,
      });
      mockActiveRoomRepository.save.mockResolvedValue({
        id: 1,
        gameRoomId: 1,
        startTime: 30,
        status: RoomStatus.PENDING,
      });

      // Mock the private method
      const startTimerSpy = jest.spyOn(service as any, 'startTimer').mockImplementation(() => {});

      const result = await (service as any).createActiveRoom(mockGameRoom);

      expect(mockActiveRoomRepository.findOne).toHaveBeenCalledWith({
        where: {
          gameRoomId: 1,
          status: RoomStatus.PENDING,
        },
      });
      expect(mockActiveRoomRepository.create).toHaveBeenCalledWith({
        gameRoomId: 1,
        startTime: 30,
        status: RoomStatus.PENDING,
      });
      expect(mockActiveRoomRepository.save).toHaveBeenCalled();
      expect(startTimerSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return existing active room if one exists', async () => {
      const mockGameRoom = {
        id: 1,
        entryFee: 1000,
        startTimer: 30,
        isActive: true,
        type: RoomType.GLOBAL,
        minPlayers: 2,
      };

      const mockExistingActiveRoom = {
        id: 1,
        gameRoomId: 1,
        startTime: 25,
        status: RoomStatus.PENDING,
      };

      mockActiveRoomRepository.findOne.mockResolvedValue(mockExistingActiveRoom);

      // Mock the private method
      const startTimerSpy = jest.spyOn(service as any, 'startTimer').mockImplementation(() => {});

      const result = await (service as any).createActiveRoom(mockGameRoom);

      expect(mockActiveRoomRepository.findOne).toHaveBeenCalledWith({
        where: {
          gameRoomId: 1,
          status: RoomStatus.PENDING,
        },
      });
      expect(mockActiveRoomRepository.create).not.toHaveBeenCalled();
      expect(startTimerSpy).toHaveBeenCalledWith(mockExistingActiveRoom);
      expect(result).toEqual(mockExistingActiveRoom);
    });
  });

  describe('processTimerTick', () => {
    it('should decrease remainingSeconds by 1 and save to database', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        remainingSeconds: 30,
        status: RoomStatus.PENDING,
      };

      const mockGameRoom = {
        id: 1,
        startTimer: 30,
        minPlayers: 2,
      };

      mockGameRoomRepository.findOne.mockResolvedValue(mockGameRoom);
      mockActiveRoomRepository.save.mockResolvedValue({
        ...mockActiveRoom,
        startTime: 29,
      });

      await (service as any).processTimerTick(mockActiveRoom);

      expect(mockGameRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockActiveRoomRepository.save).toHaveBeenCalledWith({
        ...mockActiveRoom,
        startTime: 29,
      });
    });

    it('should check player count when timer reaches zero', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        startTime: 1, // Will reach zero after decrement
        status: RoomStatus.PENDING,
      };

      const mockGameRoom = {
        id: 1,
        startTimer: 30,
        minPlayers: 2,
      };

      mockGameRoomRepository.findOne.mockResolvedValue(mockGameRoom);
      mockActiveRoomRepository.save.mockResolvedValue({
        ...mockActiveRoom,
        remainingSeconds: 0,
      });

      // Mock the private method
      const checkPlayerCountSpy = jest.spyOn(service as any, 'checkPlayerCountAndProceed').mockResolvedValue(undefined);

      await (service as any).processTimerTick(mockActiveRoom);

      expect(checkPlayerCountSpy).toHaveBeenCalledWith(
        { ...mockActiveRoom, remainingSeconds: 0 },
        mockGameRoom
      );
    });
  });

  describe('checkPlayerCountAndProceed', () => {
    it('should start game when enough players are present', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        startTime: 0,
        status: RoomStatus.PENDING,
      };

      const mockGameRoom = {
        id: 1,
        startTimer: 30,
        minPlayers: 2,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '3' }), // 3 players >= 2 minPlayers
      };

      mockReservationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockActiveRoomRepository.save.mockResolvedValue({
        ...mockActiveRoom,
        status: RoomStatus.STARTED,
      });

      // Mock the private method
      const startGameSpy = jest.spyOn(service as any, 'startGame').mockResolvedValue(undefined);

      await (service as any).checkPlayerCountAndProceed(mockActiveRoom, mockGameRoom);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'reservation.activeRoomId = :activeRoomId',
        { activeRoomId: 1 }
      );
      expect(startGameSpy).toHaveBeenCalledWith(mockActiveRoom);
    });

    it('should reset timer when not enough players', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        startTime: 0,
        status: RoomStatus.PENDING,
      };

      const mockGameRoom = {
        id: 1,
        startTimer: 30,
        minPlayers: 2,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '1' }), // 1 player < 2 minPlayers
      };

      mockReservationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockActiveRoomRepository.save.mockResolvedValue({
        ...mockActiveRoom,
        startTime: 30,
      });

      // Mock the private method
      const resetTimerSpy = jest.spyOn(service as any, 'resetTimer').mockResolvedValue(undefined);

      await (service as any).checkPlayerCountAndProceed(mockActiveRoom, mockGameRoom);

      expect(resetTimerSpy).toHaveBeenCalledWith(mockActiveRoom, mockGameRoom);
    });
  });

  describe('startGame', () => {
    it('should update status to started and stop timer', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        startTime: 0,
        status: RoomStatus.PENDING,
      };

      mockActiveRoomRepository.save.mockResolvedValue({
        ...mockActiveRoom,
        status: RoomStatus.STARTED,
        updatedAt: new Date(),
      });

      // Mock the private method
      const stopTimerSpy = jest.spyOn(service as any, 'stopTimer').mockImplementation(() => {});

      await (service as any).startGame(mockActiveRoom);

      expect(mockActiveRoomRepository.save).toHaveBeenCalledWith({
        ...mockActiveRoom,
        status: RoomStatus.STARTED,
        updatedAt: expect.any(Date),
      });
      expect(stopTimerSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('resetTimer', () => {
    it('should reset startTime to gameRoom startTimer', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        startTime: 0,
        status: RoomStatus.PENDING,
      };

      const mockGameRoom = {
        id: 1,
        startTimer: 30,
      };

      mockActiveRoomRepository.save.mockResolvedValue({
        ...mockActiveRoom,
        startTime: 30,
        updatedAt: new Date(),
      });

      await (service as any).resetTimer(mockActiveRoom, mockGameRoom);

      expect(mockActiveRoomRepository.save).toHaveBeenCalledWith({
        ...mockActiveRoom,
        startTime: 30,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear all timers on module destroy', () => {
      // Mock timers map
      const mockTimer = setTimeout(() => {}, 1000);
      (service as any).timers = new Map([[1, mockTimer], [2, mockTimer]]);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      service.onModuleDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledTimes(2);
      expect((service as any).timers.size).toBe(0);
    });
  });
});
