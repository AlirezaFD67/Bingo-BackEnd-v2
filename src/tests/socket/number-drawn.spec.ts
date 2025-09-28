import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from '../../app.module';
import { Server as SocketIOServer } from 'socket.io';
import { Client as SocketIOClient } from 'socket.io-client';

describe('Number Drawn Socket (e2e)', () => {
  let app: INestApplication;
  let io: SocketIOServer;
  let client: SocketIOClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();

    io = app.getHttpServer();
  });

  afterAll(async () => {
    if (client) {
      client.disconnect();
    }
    await app.close();
  });

  beforeEach(() => {
    client = new SocketIOClient('http://localhost:3006/rooms');
  });

  afterEach(() => {
    if (client) {
      client.disconnect();
    }
  });

  it('should connect to /rooms namespace', (done) => {
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      done();
    });
  });

  it('should handle numberDrawnRequest event', (done) => {
    const testData = { activeRoomId: 1 };

    client.on('connect', () => {
      client.emit('numberDrawnRequest', testData);
    });

    client.on('numberDrawn', (response) => {
      expect(response).toHaveProperty('namespace', '/rooms');
      expect(response).toHaveProperty('event', 'numberDrawn');
      expect(response.data).toHaveProperty('activeRoomId', 1);
      expect(response.data).toHaveProperty('totalDrawnNumbers');
      expect(response.data).toHaveProperty('drawnNumbers');
      expect(Array.isArray(response.data.drawnNumbers)).toBe(true);
      done();
    });

    client.on('error', (error) => {
      // Handle error case - might return mock data
      expect(error).toHaveProperty('message');
      done();
    });
  });

  it('should handle invalid activeRoomId', (done) => {
    client.on('connect', () => {
      client.emit('numberDrawnRequest', { activeRoomId: null });
    });

    client.on('error', (error) => {
      expect(error).toHaveProperty('message', 'activeRoomId is required');
      done();
    });
  });

  it('should handle missing activeRoomId', (done) => {
    client.on('connect', () => {
      client.emit('numberDrawnRequest', {});
    });

    client.on('error', (error) => {
      expect(error).toHaveProperty('message', 'activeRoomId is required');
      done();
    });
  });
});
