import { Injectable } from '@nestjs/common';
import {
  PendingRoomsMockResponseDto,
  PendingRoomMockDto,
} from './dto/pending-rooms-mock.dto';

@Injectable()
export class SocketMockService {
  getMockPendingRooms(): PendingRoomsMockResponseDto {
    // Mock data for testing
    const mockRooms: PendingRoomMockDto[] = [
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
        remainingSeconds: 120,
        playerCount: 1,
        entryFee: 50000,
        status: 'pending',
        minPlayers: 2,
      },
      {
        activeRoomId: 3,
        gameRoomId: 3,
        remainingSeconds: 45,
        playerCount: 4,
        entryFee: 75000,
        status: 'started',
        minPlayers: 4,
      },
    ];

    return {
      rooms: mockRooms,
    };
  }
}
