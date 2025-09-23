import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SocketMockService } from './socket-mock.service';
import { PendingRoomsMockResponseDto } from './dto/pending-rooms-mock.dto';
import { RoomsService } from '../socket/rooms.service';

@ApiTags('Socket Testing')
@Controller('socket-test')
export class SocketMockController {
  constructor(
    private readonly socketMockService: SocketMockService,
    private readonly roomsService: RoomsService,
  ) {}

  @Get('active-room-global')
  @ApiOperation({
    summary: 'Get Active Room Global (Socket Mock)',
    description: `
    **Socket Namespace:** \`/rooms\`
    
    **Send Event:** \`activeRoomGlobalRequest\`
    - Data: \`null\` (all rooms) or \`{ status: 'pending' }\` or \`{ status: 'started' }\`
    
    **Receive Event:** \`activeRoomGlobal\`
    - Data: Array of active room global with filters for status: pending | started
    
    **Socket Connection:**
    \`\`\`javascript
    const socket = io('http://localhost:3006/rooms');
    
    // Get all rooms
    socket.emit('activeRoomGlobalRequest', null);
    
    // Get only pending rooms
    socket.emit('activeRoomGlobalRequest', { status: 'pending' });
    
    // Get only started rooms
    socket.emit('activeRoomGlobalRequest', { status: 'started' });
    
    socket.on('activeRoomGlobal', (data) => {
      console.log('Received active room global:', data.rooms);
    });
    \`\`\`
    
    **Response Format:**
    \`\`\`json
    {
      "rooms": [
        {
          "activeRoomId": 1,
          "gameRoomId": 1,
          "remainingSeconds": 80,
          "playerCount": 3,
          "entryFee": 100000,
          "status": "pending",
          "minPlayers": 3
        }
      ]
    }
    \`\`\`
    `
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'started'],
    description: 'Filter rooms by status (pending | started). Leave empty to get all.',
    example: 'pending'
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending/started rooms based on filter',
    type: PendingRoomsMockResponseDto,
  })
  async getPendingRooms(
    @Query('status') status?: 'pending' | 'started'
  ): Promise<PendingRoomsMockResponseDto> {
    try {
      // Get real data from socket service
      const realRooms = await this.roomsService.getPendingRooms();
      
      // Apply status filter if provided
      let filteredRooms = realRooms;
      if (status) {
        filteredRooms = realRooms.filter(room => room.status === status);
      }
      
      return { rooms: filteredRooms };
    } catch (error) {
      // Fallback to mock data if real service fails
      const mockData = this.socketMockService.getMockPendingRooms();
      
      // Apply status filter to mock data if provided
      if (status) {
        mockData.rooms = mockData.rooms.filter(room => room.status === status);
      }
      
      return mockData;
    }
  }

}
