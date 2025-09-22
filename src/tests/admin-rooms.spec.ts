import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { GameRoom } from '../entities/game-room.entity';
import { RoomType } from '../enums/room-type.enum';

describe('Admin Game Rooms (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as admin to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/verify-otp')
      .send({
        phoneNumber: '09111234567',
        otpCode: '123456'
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/admin/rooms', () => {
    it('should create a new game room', async () => {
      const createRoomDto = {
        entryFee: 1000,
        startTimer: 30,
        type: RoomType.GLOBAL,
        minPlayers: 2
      };

      const response = await request(app.getHttpServer())
        .post('/api/admin/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRoomDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.entryFee).toBe(1000);
      expect(response.body.startTimer).toBe(30);
      expect(response.body.type).toBe(RoomType.GLOBAL);
      expect(response.body.minPlayers).toBe(2);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        entryFee: -100,
        startTimer: 0,
        type: 999,
        minPlayers: 0
      };

      await request(app.getHttpServer())
        .post('/api/admin/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/admin/rooms', () => {
    it('should return all game rooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/rooms?type=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((room: any) => {
        expect(room.type).toBe(1);
      });
    });

    it('should filter by isActive', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/rooms?isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((room: any) => {
        expect(room.isActive).toBe(true);
      });
    });

    it('should combine filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/rooms?type=1&isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((room: any) => {
        expect(room.type).toBe(1);
        expect(room.isActive).toBe(true);
      });
    });
  });

  describe('GET /api/admin/rooms/:id', () => {
    let roomId: number;

    beforeAll(async () => {
      // Create a room for testing
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryFee: 2000,
          startTimer: 45,
          type: RoomType.PRIVATE,
          minPlayers: 4
        });

      roomId = createResponse.body.id;
    });

    it('should return a specific game room', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(roomId);
      expect(response.body.entryFee).toBe(2000);
      expect(response.body.type).toBe(RoomType.PRIVATE);
    });

    it('should return 404 for non-existent room', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/rooms/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/admin/rooms/:id', () => {
    let roomId: number;

    beforeAll(async () => {
      // Create a room for testing
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryFee: 1500,
          startTimer: 25,
          type: RoomType.GLOBAL,
          minPlayers: 3
        });

      roomId = createResponse.body.id;
    });

    it('should update a game room', async () => {
      const updateDto = {
        entryFee: 3000,
        startTimer: 60,
        minPlayers: 5
      };

      const response = await request(app.getHttpServer())
        .put(`/api/admin/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.entryFee).toBe(3000);
      expect(response.body.startTimer).toBe(60);
      expect(response.body.minPlayers).toBe(5);
    });

    it('should return 404 for non-existent room', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/rooms/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entryFee: 1000 })
        .expect(404);
    });
  });

  describe('PUT /api/admin/rooms/:id/status', () => {
    let roomId: number;

    beforeAll(async () => {
      // Create a room for testing
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryFee: 1000,
          startTimer: 30,
          type: RoomType.GLOBAL,
          minPlayers: 2
        });

      roomId = createResponse.body.id;
    });

    it('should update room status', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/rooms/${roomId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should return 404 for non-existent room', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/rooms/99999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isActive: false })
        .expect(404);
    });
  });

  describe('Authentication', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/rooms')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/rooms')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
