import { Test, TestingModule } from '@nestjs/testing';
import { RoomsGateway } from '../../modules/socket/rooms.gateway';
import { RoomsService } from '../../modules/socket/rooms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { Repository } from 'typeorm';

describe('ActiveRoomGlobalSocket', () => {
  let gateway: RoomsGateway;
  let roomsService: RoomsService;
  let activeRoomRepository: Repository<ActiveRoomGlobal>;
  let gameRoomRepository: Repository<GameRoom>;
  let reservationRepository: Repository<Reservation>;

  const mockActiveRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockGameRoomRepository = {
    findOne: jest.fn(),
  };

  const mockReservationRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsGateway,
        RoomsService,
        {
          provide: getRepositoryToken(ActiveRoomGlobal),
          useValue: mockActiveRoomRepository,
        },
        {
          provide: getRepositoryToken(GameRoom),
          useValue: mockGameRoomRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    gateway = module.get<RoomsGateway>(RoomsGateway);
    roomsService = module.get<RoomsService>(RoomsService);
    activeRoomRepository = module.get<Repository<ActiveRoomGlobal>>(getRepositoryToken(ActiveRoomGlobal));
    gameRoomRepository = module.get<Repository<GameRoom>>(getRepositoryToken(GameRoom));
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RoomsGateway', () => {
    it('should be defined', () => {
      expect(gateway).toBeDefined();
    });

    it('should handle connection', () => {
      const mockSocket = {
        id: 'test-socket-id',
      } as any;

      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockSocket);
      expect(logSpy).toHaveBeenCalledWith('Client connected: test-socket-id');
    });

    it('should handle disconnection', () => {
      const mockSocket = {
        id: 'test-socket-id',
      } as any;

      const logSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockSocket);
      expect(logSpy).toHaveBeenCalledWith('Client disconnected: test-socket-id');
    });
  });

  describe('RoomsService', () => {
    it('should be defined', () => {
      expect(roomsService).toBeDefined();
    });

    it('should get pending rooms', async () => {
      const mockActiveRooms = [
        {
          id: 1,
          gameRoomId: 1,
          remainingSeconds: 80,
          status: 'pending',
          gameRoom: {
            id: 1,
            entryFee: 100000,
            minPlayers: 3,
          },
        },
      ];

      const mockPlayerCount = { count: '3' };

      mockActiveRoomRepository.find.mockResolvedValue(mockActiveRooms);
      mockReservationRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockPlayerCount),
      });

      const result = await roomsService.getPendingRooms();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        activeRoomId: 1,
        gameRoomId: 1,
        remainingSeconds: 80,
        playerCount: 3,
        entryFee: 100000,
        status: 'pending',
        minPlayers: 3,
      });
    });

    it('should handle error when getting pending rooms', async () => {
      mockActiveRoomRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(roomsService.getPendingRooms()).rejects.toThrow('Database error');
    });

    it('should get room info by activeRoomId', async () => {
      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        remainingSeconds: 120,
        status: 'started',
        gameRoom: {
          id: 1,
          entryFee: 100000,
          minPlayers: 3,
        },
      };

      const mockReservedCards = { totalCards: '15' };
      const mockPlayerCount = { count: '5' };

      mockActiveRoomRepository.findOne.mockResolvedValue(mockActiveRoom);
      mockReservationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      
      // Mock for reserved cards query
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce(mockReservedCards) // First call for reserved cards
        .mockResolvedValueOnce(mockPlayerCount); // Second call for player count

      const result = await roomsService.getRoomInfo(1);

      expect(result).toEqual({
        status: 'started',
        remainingSeconds: 120,
        availableCards: 15, // 30 - 15 = 15
        playerCount: 5,
      });
    });

    it('should throw error when active room not found', async () => {
      mockActiveRoomRepository.findOne.mockResolvedValue(null);

      await expect(roomsService.getRoomInfo(999)).rejects.toThrow('Active room with ID 999 not found');
    });

    it('should handle error when getting room info', async () => {
      mockActiveRoomRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(roomsService.getRoomInfo(1)).rejects.toThrow('Database error');
    });
  });

  describe('Socket Events', () => {
    it('should emit activeRoomGlobal event with all rooms', async () => {
      const mockSocket = {
        emit: jest.fn(),
      } as any;

      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      const mockRooms = [
        {
          activeRoomId: 1,
          gameRoomId: 1,
          remainingSeconds: 80,
          playerCount: 3,
          entryFee: 100000,
          status: 'pending',
          minPlayers: 3,
        },
      ];

      jest.spyOn(roomsService, 'getPendingRooms').mockResolvedValue(mockRooms);

      await gateway.handleActiveRoomGlobalRequest({});

      expect(gateway['server'].emit).toHaveBeenCalledWith('activeRoomGlobal', {
        rooms: mockRooms,
      });
    });

    it('should emit activeRoomGlobal event with filtered pending rooms', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      const mockRooms = [
        {
          activeRoomId: 1,
          gameRoomId: 1,
          remainingSeconds: 80,
          playerCount: 3,
          entryFee: 100000,
          status: 'pending',
          minPlayers: 3,
        },
        {
          activeRoomId: 2,
          gameRoomId: 2,
          remainingSeconds: 45,
          playerCount: 4,
          entryFee: 75000,
          status: 'started',
          minPlayers: 4,
        },
      ];

      jest.spyOn(roomsService, 'getPendingRooms').mockResolvedValue(mockRooms);

      await gateway.handleActiveRoomGlobalRequest({ status: 'pending' });

      expect(gateway['server'].emit).toHaveBeenCalledWith('activeRoomGlobal', {
        rooms: [mockRooms[0]], // Only pending room
      });
    });

    it('should emit error event when service fails', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      jest.spyOn(roomsService, 'getPendingRooms').mockRejectedValue(new Error('Service error'));

      await gateway.handleActiveRoomGlobalRequest({});

      expect(gateway['server'].emit).toHaveBeenCalledWith('error', {
        message: 'Failed to fetch active room global',
      });
    });

    it('should emit roomInfo event with room data', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      const mockRoomInfo = {
        status: 'started',
        remainingSeconds: 120,
        availableCards: 15,
        playerCount: 5,
      };

      jest.spyOn(roomsService, 'getRoomInfo').mockResolvedValue(mockRoomInfo);

      await gateway.handleRoomInfoRequest({ activeRoomId: 1 });

      expect(gateway['server'].emit).toHaveBeenCalledWith('roomInfo', mockRoomInfo);
    });

    it('should emit error when activeRoomId is missing', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      await gateway.handleRoomInfoRequest({ activeRoomId: undefined as any });

      expect(gateway['server'].emit).toHaveBeenCalledWith('error', {
        message: 'activeRoomId is required',
      });
    });

    it('should emit error when room info service fails', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      jest.spyOn(roomsService, 'getRoomInfo').mockRejectedValue(new Error('Service error'));

      await gateway.handleRoomInfoRequest({ activeRoomId: 1 });

      expect(gateway['server'].emit).toHaveBeenCalledWith('error', {
        message: 'Failed to fetch room info',
      });
    });
  });
});
