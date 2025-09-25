import { Test, TestingModule } from '@nestjs/testing';
import { RoomsGateway } from '../../modules/socket/rooms.gateway';
import { RoomsService } from '../../modules/socket/rooms.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { Card } from '../../entities/card.entity';
import { ActiveRoomWinner } from '../../entities/active-room-winners.entity';
import { Repository } from 'typeorm';

describe('WinSocket', () => {
  let gateway: RoomsGateway;
  let roomsService: RoomsService;
  let activeRoomRepository: Repository<ActiveRoomGlobal>;
  let activeRoomWinnerRepository: Repository<ActiveRoomWinner>;
  let userReservedCardRepository: Repository<UserReservedCard>;
  let cardRepository: Repository<Card>;
  let drawnNumberRepository: Repository<DrawnNumber>;

  const mockActiveRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockActiveRoomWinnerRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserReservedCardRepository = {
    find: jest.fn(),
  };

  const mockCardRepository = {
    find: jest.fn(),
  };

  const mockDrawnNumberRepository = {
    find: jest.fn(),
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
          useValue: {},
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(DrawnNumber),
          useValue: mockDrawnNumberRepository,
        },
        {
          provide: getRepositoryToken(UserReservedCard),
          useValue: mockUserReservedCardRepository,
        },
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(ActiveRoomWinner),
          useValue: mockActiveRoomWinnerRepository,
        },
      ],
    }).compile();

    gateway = module.get<RoomsGateway>(RoomsGateway);
    roomsService = module.get<RoomsService>(RoomsService);
    activeRoomRepository = module.get<Repository<ActiveRoomGlobal>>(getRepositoryToken(ActiveRoomGlobal));
    activeRoomWinnerRepository = module.get<Repository<ActiveRoomWinner>>(getRepositoryToken(ActiveRoomWinner));
    userReservedCardRepository = module.get<Repository<UserReservedCard>>(getRepositoryToken(UserReservedCard));
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    drawnNumberRepository = module.get<Repository<DrawnNumber>>(getRepositoryToken(DrawnNumber));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RoomsService - Winner Detection', () => {
    it('should check line winners successfully', async () => {
      const activeRoomId = 1;
      const mockDrawnNumbers = [
        { number: 1 },
        { number: 2 },
        { number: 3 },
        { number: 4 },
        { number: 5 },
      ];
      const mockReservedCards = [
        {
          userId: 1,
          cardId: 1,
          card: {
            matrix: [
              [1, 2, 3, 4, 5], // Complete line
              [6, 7, 8, 9, 10],
              [11, 12, 13, 14, 15],
            ],
          },
        },
      ];

      mockActiveRoomWinnerRepository.findOne.mockResolvedValue(null); // No existing winners
      mockDrawnNumberRepository.find.mockResolvedValue(mockDrawnNumbers);
      mockUserReservedCardRepository.find.mockResolvedValue(mockReservedCards);
      mockActiveRoomWinnerRepository.save.mockResolvedValue({});

      const result = await roomsService.checkLineWinners(activeRoomId);

      expect(result).toBe(true);
      expect(mockActiveRoomWinnerRepository.save).toHaveBeenCalledWith({
        activeRoomId: 1,
        userId: 1,
        cardId: 1,
        winType: 'line',
      });
    });

    it('should not find line winners when line is incomplete', async () => {
      const activeRoomId = 1;
      const mockDrawnNumbers = [
        { number: 1 },
        { number: 2 },
        { number: 3 },
        // Missing 4 and 5
      ];
      const mockReservedCards = [
        {
          userId: 1,
          cardId: 1,
          card: {
            matrix: [
              [1, 2, 3, 4, 5], // Incomplete line
              [6, 7, 8, 9, 10],
              [11, 12, 13, 14, 15],
            ],
          },
        },
      ];

      mockActiveRoomWinnerRepository.findOne.mockResolvedValue(null);
      mockDrawnNumberRepository.find.mockResolvedValue(mockDrawnNumbers);
      mockUserReservedCardRepository.find.mockResolvedValue(mockReservedCards);

      const result = await roomsService.checkLineWinners(activeRoomId);

      expect(result).toBe(false);
      expect(mockActiveRoomWinnerRepository.save).not.toHaveBeenCalled();
    });

    it('should check full winners successfully', async () => {
      const activeRoomId = 1;
      const mockDrawnNumbers = [
        { number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }, { number: 5 },
        { number: 6 }, { number: 7 }, { number: 8 }, { number: 9 }, { number: 10 },
        { number: 11 }, { number: 12 }, { number: 13 }, { number: 14 }, { number: 15 },
      ];
      const mockReservedCards = [
        {
          userId: 1,
          cardId: 1,
          card: {
            matrix: [
              [1, 2, 3, 4, 5],
              [6, 7, 8, 9, 10],
              [11, 12, 13, 14, 15],
            ],
          },
        },
      ];

      mockDrawnNumberRepository.find.mockResolvedValue(mockDrawnNumbers);
      mockUserReservedCardRepository.find.mockResolvedValue(mockReservedCards);
      mockActiveRoomWinnerRepository.save.mockResolvedValue({});
      mockActiveRoomRepository.update.mockResolvedValue({});

      const result = await roomsService.checkFullWinners(activeRoomId);

      expect(result).toBe(true);
      expect(mockActiveRoomWinnerRepository.save).toHaveBeenCalledWith({
        activeRoomId: 1,
        userId: 1,
        cardId: 1,
        winType: 'full',
      });
      expect(mockActiveRoomRepository.update).toHaveBeenCalledWith(
        { id: activeRoomId },
        { status: 'finished' }
      );
    });

    it('should get winners successfully', async () => {
      const activeRoomId = 1;
      const mockWinners = [
        {
          userId: 1,
          cardId: 1,
          winType: 'line',
        },
        {
          userId: 2,
          cardId: 2,
          winType: 'full',
        },
      ];
      const mockActiveRoom = {
        status: 'finished',
      };

      mockActiveRoomWinnerRepository.find.mockResolvedValue(mockWinners);
      mockActiveRoomRepository.findOne.mockResolvedValue(mockActiveRoom);

      const result = await roomsService.getWinners(activeRoomId);

      expect(result).toEqual({
        lineWinners: [
          {
            userId: 1,
            cardId: 1,
            amount: 50000,
          },
        ],
        fullWinners: [
          {
            userId: 2,
            cardId: 2,
            amount: 150000,
          },
        ],
        gameFinished: true,
      });
    });

    it('should handle error when checking line winners', async () => {
      const activeRoomId = 1;

      mockActiveRoomWinnerRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await roomsService.checkLineWinners(activeRoomId);

      expect(result).toBe(false);
    });

    it('should handle error when checking full winners', async () => {
      const activeRoomId = 1;

      mockDrawnNumberRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await roomsService.checkFullWinners(activeRoomId);

      expect(result).toBe(false);
    });

    it('should handle error when getting winners', async () => {
      const activeRoomId = 1;

      mockActiveRoomWinnerRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await roomsService.getWinners(activeRoomId);

      expect(result).toEqual({
        lineWinners: [],
        fullWinners: [],
        gameFinished: false,
      });
    });
  });

  describe('RoomsGateway - Win Events', () => {
    it('should emit win event with winners data', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      const mockWinners = {
        lineWinners: [
          {
            userId: 1,
            cardId: 1,
            amount: 50000,
          },
        ],
        fullWinners: [
          {
            userId: 2,
            cardId: 2,
            amount: 150000,
          },
        ],
        gameFinished: true,
      };

      jest.spyOn(roomsService, 'getWinners').mockResolvedValue(mockWinners);

      await gateway.handleWinRequest({ activeRoomId: 1 });

      expect(gateway['server'].emit).toHaveBeenCalledWith('win', {
        namespace: '/rooms',
        event: 'win',
        data: {
          activeRoomId: 1,
          lineWinners: mockWinners.lineWinners,
          fullWinners: mockWinners.fullWinners,
          gameFinished: mockWinners.gameFinished,
        },
      });
    });

    it('should emit error when activeRoomId is missing', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      await gateway.handleWinRequest({ activeRoomId: undefined as any });

      expect(gateway['server'].emit).toHaveBeenCalledWith('error', {
        message: 'activeRoomId is required',
      });
    });

    it('should emit error when service fails', async () => {
      gateway['server'] = {
        emit: jest.fn(),
      } as any;

      jest.spyOn(roomsService, 'getWinners').mockRejectedValue(new Error('Service error'));

      await gateway.handleWinRequest({ activeRoomId: 1 });

      expect(gateway['server'].emit).toHaveBeenCalledWith('error', {
        message: 'Failed to fetch winners',
      });
    });
  });
});
