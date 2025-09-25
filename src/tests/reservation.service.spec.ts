import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReservationService } from '../modules/reservation/reservation.service';
import { Reservation } from '../entities/reservation.entity';
import { GameRoom } from '../entities/game-room.entity';
import { ActiveRoomGlobal } from '../entities/active-room-global.entity';
import { RoomStatus } from '../enums/room-status.enum';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepository: Repository<Reservation>;
  let gameRoomRepository: Repository<GameRoom>;
  let activeRoomRepository: Repository<ActiveRoomGlobal>;

  const mockReservationRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGameRoomRepository = {
    findOne: jest.fn(),
  };

  const mockActiveRoomRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(GameRoom),
          useValue: mockGameRoomRepository,
        },
        {
          provide: getRepositoryToken(ActiveRoomGlobal),
          useValue: mockActiveRoomRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepository = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    gameRoomRepository = module.get<Repository<GameRoom>>(getRepositoryToken(GameRoom));
    activeRoomRepository = module.get<Repository<ActiveRoomGlobal>>(getRepositoryToken(ActiveRoomGlobal));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reserve', () => {
    const userId = 1;
    const dto = { activeRoomId: 1, cardCount: 2 };

    it('should throw BadRequestException for invalid user', async () => {
      await expect(service.reserve(null, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when active room not found', async () => {
      mockActiveRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.reserve(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when room is not pending', async () => {
      const activeRoom = { id: 1, status: RoomStatus.STARTED };
      mockActiveRoomRepository.findOne.mockResolvedValue(activeRoom);

      await expect(service.reserve(userId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when game room not found', async () => {
      const activeRoom = { id: 1, status: RoomStatus.PENDING, gameRoomId: 1 };
      mockActiveRoomRepository.findOne.mockResolvedValue(activeRoom);
      mockGameRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.reserve(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should create reservation successfully', async () => {
      const activeRoom = { id: 1, status: RoomStatus.PENDING, gameRoomId: 1 };
      const gameRoom = { id: 1, entryFee: 1000 };
      const reservation = { id: 123, userId, cardCount: 2, entryFee: 1000, activeRoomId: 1 };

      mockActiveRoomRepository.findOne.mockResolvedValue(activeRoom);
      mockGameRoomRepository.findOne.mockResolvedValue(gameRoom);
      mockReservationRepository.create.mockReturnValue(reservation);
      mockReservationRepository.save.mockResolvedValue(reservation);

      const result = await service.reserve(userId, dto);

      expect(result).toEqual({ id: 123 });
      expect(mockReservationRepository.create).toHaveBeenCalledWith({
        userId,
        cardCount: dto.cardCount,
        entryFee: gameRoom.entryFee,
        activeRoomId: activeRoom.id,
      });
    });
  });
});

