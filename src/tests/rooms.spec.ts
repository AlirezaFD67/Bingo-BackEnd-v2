import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActiveRoomGlobal } from '../entities/active-room-global.entity';
import { GameRoom } from '../entities/game-room.entity';
import { RoomStatus } from '../enums/room-status.enum';
import { RoomType } from '../enums/room-type.enum';

describe('Rooms API (e2e)', () => {
  let app: INestApplication;
  let activeRoomRepository: any;
  let gameRoomRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    activeRoomRepository = moduleFixture.get(getRepositoryToken(ActiveRoomGlobal));
    gameRoomRepository = moduleFixture.get(getRepositoryToken(GameRoom));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /rooms/:id', () => {
    it('should return active room information', async () => {
      // Mock data
      const mockGameRoom = {
        id: 1,
        entryFee: 100000,
        startTimer: 100,
        isActive: true,
        type: RoomType.GLOBAL,
        minPlayers: 3,
        createdAt: new Date('2024-03-20T12:00:00Z'),
      };

      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        remainingSeconds: 100,
        status: RoomStatus.PENDING,
        createdAt: new Date('2024-06-25T18:00:00Z'),
        updatedAt: new Date('2024-06-25T18:00:00Z'),
        gameRoom: mockGameRoom,
      };

      // Mock repository methods
      activeRoomRepository.findOne = jest.fn().mockResolvedValue(mockActiveRoom);

      const response = await request(app.getHttpServer())
        .get('/rooms/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('gameRoom');
      expect(response.body.gameRoom).toHaveProperty('id', 1);
      expect(response.body.gameRoom).toHaveProperty('entryFee', 100000);
      expect(response.body.gameRoom).toHaveProperty('startTimer', 100);
      expect(response.body.gameRoom).toHaveProperty('isActive', true);
      expect(response.body.gameRoom).toHaveProperty('type', 1);
      expect(response.body.gameRoom).toHaveProperty('minPlayers', 3);
    });

    it('should return 404 for non-existent room', async () => {
      activeRoomRepository.findOne = jest.fn().mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/rooms/99999')
        .expect(404);
    });


    it('should handle invalid room ID format', async () => {
      await request(app.getHttpServer())
        .get('/rooms/invalid')
        .expect(400);
    });

    it('should include Persian date conversion', async () => {
      const mockGameRoom = {
        id: 1,
        entryFee: 100000,
        startTimer: 100,
        isActive: true,
        type: RoomType.GLOBAL,
        minPlayers: 3,
        createdAt: new Date('2024-03-20T12:00:00Z'),
      };

      const mockActiveRoom = {
        id: 1,
        gameRoomId: 1,
        remainingSeconds: 100,
        status: RoomStatus.PENDING,
        createdAt: new Date('2024-06-25T18:00:00Z'),
        updatedAt: new Date('2024-06-25T18:00:00Z'),
        gameRoom: mockGameRoom,
      };

      activeRoomRepository.findOne = jest.fn().mockResolvedValue(mockActiveRoom);

      const response = await request(app.getHttpServer())
        .get('/rooms/1')
        .expect(200);

      expect(response.body.gameRoom).toHaveProperty('createdAtPersian');
      expect(typeof response.body.gameRoom.createdAtPersian).toBe('string');
    });
  });
});
