import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PendingRoomsResponseDto } from './dto/pending-rooms-response.dto';
import { SocketScheduler } from '../../utils/SocketScheduler';

interface RoomMemoryState {
  activeRoomId: number;
  gameRoomId: number;
  status: 'pending' | 'started' | 'finished';
  remainingSeconds: number;
  playerCount: number;
  entryFee: number;
  minPlayers: number;
  availableCards: number;
  drawnNumbers: number[];
  totalDrawnNumbers: number;
  lineWinners: Array<{ userId: number; cardId: number; amount: number }>;
  fullWinners: Array<{ userId: number; cardId: number; amount: number }>;
  gameFinished: boolean;
  lastUpdate: number;
}

@WebSocketGateway({
  namespace: '/rooms',
  cors: { origin: '*' },
})
export class RoomsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RoomsGateway.name);

  @WebSocketServer()
  server: Server;

  private scheduler = SocketScheduler.getInstance();
  private roomsCache: Map<number, RoomMemoryState> = new Map();
  private clients: Map<string, Socket> = new Map();
  private initializedClients: Set<string> = new Set();
  private readonly EMIT_INTERVAL = 1000;
  private readonly SYNC_INTERVAL = 5000;

  constructor(private readonly roomsService: RoomsService) {}

  async afterInit() {
    this.logger.log('RoomsGateway initialized');

    await this.loadInitialDataToCache();
    this.scheduler.registerNamespace('/rooms', this.server);

    // Job 1: هر ثانیه remainingSeconds کم و emit
    this.scheduler.addJob('decrementRemainingSeconds', this.EMIT_INTERVAL, async () => {
      const now = Date.now();
      let decrementedCount = 0;
      this.roomsCache.forEach((room) => {
        if ((room.status === 'pending' || room.status === 'started') && room.remainingSeconds > 0) {
          room.remainingSeconds -= 1;
          room.lastUpdate = now;
          decrementedCount++;
          this.logger.debug(`Room ${room.activeRoomId}: remainingSeconds = ${room.remainingSeconds}`);
        }
      });
      if (decrementedCount > 0) {
        this.logger.debug(`Decremented ${decrementedCount} rooms`);
      }
      await this.emitActiveRoomGlobalFromCache();
    }, { avoidCatchUp: true });

    // Job 2: Sync با دیتابیس هر 5 ثانیه
    this.scheduler.addJob('syncWithDatabase', this.SYNC_INTERVAL, async () => {
      await this.syncCacheWithDatabase();
    });

    this.scheduler.start();
    this.logger.log('SocketScheduler started with in-memory cache');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
    this.initializedClients.delete(client.id);
  }

  private async loadInitialDataToCache() {
    try {
      const rooms = await this.roomsService.getPendingRooms();
      for (const room of rooms) {
        const roomState: RoomMemoryState = {
          activeRoomId: room.activeRoomId,
          gameRoomId: room.gameRoomId,
          status: room.status as 'pending' | 'started' | 'finished',
          remainingSeconds: room.remainingSeconds,
          playerCount: room.playerCount,
          entryFee: room.entryFee,
          minPlayers: room.minPlayers,
          availableCards: 30,
          drawnNumbers: [],
          totalDrawnNumbers: 0,
          lineWinners: [],
          fullWinners: [],
          gameFinished: false,
          lastUpdate: Date.now(),
        };

        if (room.status === 'started') {
          try {
            const drawnData = await this.roomsService.getDrawnNumbers(room.activeRoomId);
            roomState.drawnNumbers = drawnData.drawnNumbers;
            roomState.totalDrawnNumbers = drawnData.total;

            const winners = await this.roomsService.getWinners(room.activeRoomId);
            roomState.lineWinners = winners.lineWinners;
            roomState.fullWinners = winners.fullWinners;
            roomState.gameFinished = winners.gameFinished;

            const roomInfo = await this.roomsService.getRoomInfo(room.activeRoomId);
            roomState.availableCards = roomInfo.availableCards;
          } catch (err) {
            this.logger.error(`Error loading details for room ${room.activeRoomId}:`, err);
          }
        }

        this.roomsCache.set(room.activeRoomId, roomState);
      }
      this.logger.log(`Loaded ${this.roomsCache.size} rooms into memory cache`);
    } catch (error) {
      this.logger.error('Error loading initial data to cache:', error);
    }
  }

  private async syncCacheWithDatabase() {
    try {
      const dbRooms = await this.roomsService.getPendingRooms();
      const dbRoomIds = new Set(dbRooms.map((r) => r.activeRoomId));

      for (const [roomId] of this.roomsCache) {
        if (!dbRoomIds.has(roomId)) {
          this.roomsCache.delete(roomId);
        }
      }

      for (const room of dbRooms) {
        const existingRoom = this.roomsCache.get(room.activeRoomId);

        if (existingRoom) {
          existingRoom.status = room.status as 'pending' | 'started' | 'finished';
          // فقط اگر remainingSeconds در cache صفر یا منفی شده، از دیتابیس بگیر
          if (existingRoom.remainingSeconds <= 0) {
            existingRoom.remainingSeconds = room.remainingSeconds;
          }
          existingRoom.playerCount = room.playerCount;
          existingRoom.lastUpdate = Date.now();

          if (room.status === 'started') {
            try {
              const [drawnData, winners, roomInfo] = await Promise.all([
                this.roomsService.getDrawnNumbers(room.activeRoomId),
                this.roomsService.getWinners(room.activeRoomId),
                this.roomsService.getRoomInfo(room.activeRoomId),
              ]);
              existingRoom.drawnNumbers = drawnData.drawnNumbers;
              existingRoom.totalDrawnNumbers = drawnData.total;
              existingRoom.lineWinners = winners.lineWinners;
              existingRoom.fullWinners = winners.fullWinners;
              existingRoom.gameFinished = winners.gameFinished;
              existingRoom.availableCards = roomInfo.availableCards;
            } catch (err) {
              this.logger.error(`Error syncing details for room ${room.activeRoomId}:`, err);
            }
          }
        } else {
          const newRoomState: RoomMemoryState = {
            activeRoomId: room.activeRoomId,
            gameRoomId: room.gameRoomId,
            status: room.status as 'pending' | 'started' | 'finished',
            remainingSeconds: room.remainingSeconds,
            playerCount: room.playerCount,
            entryFee: room.entryFee,
            minPlayers: room.minPlayers,
            availableCards: 30,
            drawnNumbers: [],
            totalDrawnNumbers: 0,
            lineWinners: [],
            fullWinners: [],
            gameFinished: false,
            lastUpdate: Date.now(),
          };
          this.roomsCache.set(room.activeRoomId, newRoomState);
        }
      }
    } catch (error) {
      this.logger.error('Error syncing cache with database:', error);
    }
  }

  private async emitActiveRoomGlobalFromCache() {
    if (this.clients.size === 0) return;

    try {
      const rooms = Array.from(this.roomsCache.values())
        .filter((r) => r.status === 'pending' || r.status === 'started')
        .map((r) => ({
          activeRoomId: r.activeRoomId,
          gameRoomId: r.gameRoomId,
          remainingSeconds: r.remainingSeconds,
          playerCount: r.playerCount,
          entryFee: r.entryFee,
          status: r.status,
          minPlayers: r.minPlayers,
        }))
        .sort((a, b) => a.entryFee - b.entryFee);

      this.scheduler.emitToNamespace('/rooms', 'activeRoomGlobal', { rooms });
    } catch (err) {
      this.logger.error('Error emitting activeRoomGlobal from cache:', err);
    }
  }

  @SubscribeMessage('activeRoomGlobalRequest')
  async handleActiveRoomGlobalRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { status?: 'pending' | 'started' },
  ) {
    try {
      const rooms = Array.from(this.roomsCache.values())
        .filter((r) => r.status === 'pending' || r.status === 'started')
        .map((r) => ({
          activeRoomId: r.activeRoomId,
          gameRoomId: r.gameRoomId,
          remainingSeconds: r.remainingSeconds,
          playerCount: r.playerCount,
          entryFee: r.entryFee,
          status: r.status,
          minPlayers: r.minPlayers,
        }))
        .sort((a, b) => a.entryFee - b.entryFee);

      const filteredRooms = data?.status
        ? rooms.filter((r) => r.status === data.status)
        : rooms;

      const response: PendingRoomsResponseDto = { rooms: filteredRooms };
      client.emit('activeRoomGlobal', response);
      this.initializedClients.add(client.id);
    } catch (err) {
      client.emit('error', { message: 'Failed to fetch active rooms' });
    }
  }

  @SubscribeMessage('roomInfoRequest')
  async handleRoomInfoRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { activeRoomId: number },
  ) {
    try {
      const roomState = this.roomsCache.get(data.activeRoomId);
      if (!roomState) {
        const roomInfo = await this.roomsService.getRoomInfo(data.activeRoomId);
        this.scheduler.emitToSocket(client, 'roomInfo', roomInfo);
        return;
      }

      const roomInfo = {
        status: roomState.status,
        remainingSeconds: roomState.remainingSeconds,
        availableCards: roomState.availableCards,
        playerCount: roomState.playerCount,
      };
      this.scheduler.emitToSocket(client, 'roomInfo', roomInfo);
    } catch (err) {
      client.emit('error', { message: 'Failed to fetch room info' });
    }
  }

  @SubscribeMessage('numberDrawnRequest')
  async handleNumberDrawnRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { activeRoomId: number },
  ) {
    try {
      const roomState = this.roomsCache.get(data.activeRoomId);
      if (!roomState) {
        const result = await this.roomsService.getDrawnNumbers(data.activeRoomId);
        const lastNumber =
          result.drawnNumbers.length > 0
            ? result.drawnNumbers[result.drawnNumbers.length - 1]
            : null;
        const drawnData = {
          data: {
            activeRoomId: data.activeRoomId,
            number: lastNumber,
            totalDrawnNumbers: result.total,
            drawnNumbers: result.drawnNumbers,
          },
        };
        this.scheduler.emitToSocket(client, 'numberDrawn', drawnData);
        return;
      }

      const lastNumber =
        roomState.drawnNumbers.length > 0
          ? roomState.drawnNumbers[roomState.drawnNumbers.length - 1]
          : null;
      const drawnData = {
        data: {
          activeRoomId: data.activeRoomId,
          number: lastNumber,
          totalDrawnNumbers: roomState.totalDrawnNumbers,
          drawnNumbers: roomState.drawnNumbers,
        },
      };
      this.scheduler.emitToSocket(client, 'numberDrawn', drawnData);
    } catch (err) {
      client.emit('error', { message: 'Failed to fetch drawn numbers' });
    }
  }

  @SubscribeMessage('winRequest')
  async handleWinRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { activeRoomId: number },
  ) {
    try {
      const roomState = this.roomsCache.get(data.activeRoomId);
      if (!roomState) {
        const winners = await this.roomsService.getWinners(data.activeRoomId);
        this.scheduler.emitToSocket(client, 'winResponse', winners);
        return;
      }

      const winners = {
        lineWinners: roomState.lineWinners,
        fullWinners: roomState.fullWinners,
        gameFinished: roomState.gameFinished,
      };
      this.scheduler.emitToSocket(client, 'winResponse', winners);
    } catch (err) {
      client.emit('error', { message: 'Failed to fetch winners' });
    }
  }

  async refreshCache() {
    await this.syncCacheWithDatabase();
  }

  getCacheStatus() {
    return {
      totalRooms: this.roomsCache.size,
      pendingRooms: Array.from(this.roomsCache.values()).filter(
        (r) => r.status === 'pending',
      ).length,
      startedRooms: Array.from(this.roomsCache.values()).filter(
        (r) => r.status === 'started',
      ).length,
      connectedClients: this.clients.size,
      rooms: Array.from(this.roomsCache.values()).map((r) => ({
        activeRoomId: r.activeRoomId,
        status: r.status,
        playerCount: r.playerCount,
        drawnNumbers: r.totalDrawnNumbers,
        lastUpdate: new Date(r.lastUpdate).toISOString(),
      })),
    };
  }
}
