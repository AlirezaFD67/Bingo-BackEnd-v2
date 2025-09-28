import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PendingRoomsResponseDto } from './dto/pending-rooms-response.dto';
import { RoomInfoResponseDto } from './dto/room-info-response.dto';

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RoomsGateway.name);

  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('activeRoomGlobalRequest')
  async handleActiveRoomGlobalRequest(
    @MessageBody() data: { status?: 'pending' | 'started' },
  ) {
    try {
      this.logger.log(
        `Received activeRoomGlobalRequest with filter: ${data?.status || 'all'}`,
      );

      const rooms = await this.roomsService.getPendingRooms();

      // Apply status filter if provided
      let filteredRooms = rooms;
      if (data?.status) {
        filteredRooms = rooms.filter((room) => room.status === data.status);
      }

      const response: PendingRoomsResponseDto = {
        rooms: filteredRooms,
      };

      // Send response back to the client
      this.server.emit('activeRoomGlobal', response);

      this.logger.log(
        `Sent ${filteredRooms.length} filtered rooms (status: ${data?.status || 'all'})`,
      );
    } catch (error) {
      this.logger.error('Error handling activeRoomGlobalRequest:', error);
      this.server.emit('error', {
        message: 'Failed to fetch active room global',
      });
    }
  }

  @SubscribeMessage('roomInfoRequest')
  async handleRoomInfoRequest(@MessageBody() data: { activeRoomId: number }) {
    try {
      this.logger.log(
        `Received roomInfoRequest for activeRoomId: ${data.activeRoomId}`,
      );

      if (!data.activeRoomId) {
        this.server.emit('error', { message: 'activeRoomId is required' });
        return;
      }

      const roomInfo = await this.roomsService.getRoomInfo(data.activeRoomId);

      // Send response back to the client
      this.server.emit('roomInfo', roomInfo);

      this.logger.log(
        `Sent room info for activeRoomId ${data.activeRoomId}: ${JSON.stringify(roomInfo)}`,
      );
    } catch (error) {
      this.logger.error('Error handling roomInfoRequest:', error);
      this.server.emit('error', { message: 'Failed to fetch room info' });
    }
  }

  @SubscribeMessage('numberDrawnRequest')
  async handleNumberDrawnRequest(
    @MessageBody() data: { activeRoomId: number },
  ) {
    try {
      this.logger.log(
        `Received numberDrawnRequest for activeRoomId: ${data?.activeRoomId}`,
      );

      if (!data?.activeRoomId) {
        this.server.emit('error', { message: 'activeRoomId is required' });
        return;
      }

      const { drawnNumbers, total } = await this.roomsService.getDrawnNumbers(
        data.activeRoomId,
      );

      const lastNumber =
        drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;

      this.server.emit('numberDrawn', {
        namespace: '/rooms',
        event: 'numberDrawn',
        data: {
          activeRoomId: data.activeRoomId,
          number: lastNumber,
          totalDrawnNumbers: total,
          drawnNumbers,
        },
      });
    } catch (error) {
      this.logger.error('Error handling numberDrawnRequest:', error);
      this.server.emit('error', { message: 'Failed to fetch drawn numbers' });
    }
  }

  @SubscribeMessage('winRequest')
  async handleWinRequest(@MessageBody() data: { activeRoomId: number }) {
    try {
      this.logger.log(
        `Received winRequest for activeRoomId: ${data?.activeRoomId}`,
      );

      if (!data?.activeRoomId) {
        this.server.emit('error', { message: 'activeRoomId is required' });
        return;
      }

      const winners = await this.roomsService.getWinners(data.activeRoomId);

      this.server.emit('win', {
        namespace: '/rooms',
        event: 'win',
        data: {
          activeRoomId: data.activeRoomId,
          lineWinners: winners.lineWinners,
          fullWinners: winners.fullWinners,
          gameFinished: winners.gameFinished,
        },
      });

      this.logger.log(
        `Sent winners for activeRoomId ${data.activeRoomId}: ${JSON.stringify(winners)}`,
      );
    } catch (error) {
      this.logger.error('Error handling winRequest:', error);
      this.server.emit('error', { message: 'Failed to fetch winners' });
    }
  }
}
