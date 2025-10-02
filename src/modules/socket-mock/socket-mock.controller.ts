import { Controller, Get, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SocketMockService } from './socket-mock.service';
import { PendingRoomsMockResponseDto } from './dto/pending-rooms-mock.dto';
import { RoomsService } from '../socket/rooms.service';
import { RoomInfoResponseDto } from '../socket/dto/room-info-response.dto';

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
    `,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'started'],
    description:
      'Filter rooms by status (pending | started). Leave empty to get all.',
    example: 'pending',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending/started rooms based on filter',
    type: PendingRoomsMockResponseDto,
  })
  async getPendingRooms(
    @Query('status') status?: 'pending' | 'started',
  ): Promise<PendingRoomsMockResponseDto> {
    try {
      // Get real data from socket service
      const realRooms = await this.roomsService.getPendingRooms();

      // Apply status filter if provided
      let filteredRooms = realRooms;
      if (status) {
        filteredRooms = realRooms.filter((room) => room.status === status);
      }

      return { rooms: filteredRooms };
    } catch (error) {
      // Fallback to mock data if real service fails
      const mockData = this.socketMockService.getMockPendingRooms();

      // Apply status filter to mock data if provided
      if (status) {
        mockData.rooms = mockData.rooms.filter(
          (room) => room.status === status,
        );
      }

      return mockData;
    }
  }

  @Get('active-room-info')
  @ApiOperation({
    summary: 'Get Active Room Info (Socket Mock)',
    description: `
    **Socket Namespace:** \`/rooms\`
    
    **Send Event:** \`roomInfoRequest\`
    - Data: \`{ activeRoomId: number }\`
    
    **Receive Event:** \`roomInfo\`
    - Data: Room information including status, remaining seconds, available cards, and player count
    
    **Socket Connection:**
    \`\`\`javascript
    const socket = io('http://localhost:3006/rooms');
    
    socket.emit('roomInfoRequest', { activeRoomId: 1 });
    
    socket.on('roomInfo', (data) => {
      console.log('Room Info:', data);
      // Response format:
      // {
      //   "status": "started",
      //   "remainingSeconds": 120,
      //   "availableCards": 15,
      //   "playerCount": 5
      // }
    });
    \`\`\`
    
    **Response Format:**
    \`\`\`json
    {
      "status": "started",
      "remainingSeconds": 120,
      "availableCards": 15,
      "playerCount": 5
    }
    \`\`\`
    `,
  })
  @ApiQuery({
    name: 'activeRoomId',
    required: true,
    type: 'number',
    description: 'Active room ID to get information for',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Room information including status, remaining seconds, available cards, and player count',
    type: RoomInfoResponseDto,
  })
  async getRoomInfo(
    @Query('activeRoomId', ParseIntPipe) activeRoomId: number,
  ): Promise<RoomInfoResponseDto> {
    // Validation: Check if activeRoomId is provided and valid
    if (!activeRoomId || activeRoomId <= 0 || !Number.isInteger(activeRoomId)) {
      throw new BadRequestException('activeRoomId is required and must be a positive integer');
    }

    try {
      // Get real data from socket service
      return await this.roomsService.getRoomInfo(activeRoomId);
    } catch (error) {
      // Fallback to mock data if real service fails
      return {
        status: 'started',
        remainingSeconds: 120,
        availableCards: 15,
        playerCount: 5,
      };
    }
  }

  @Get('number-drawn')
  @ApiOperation({
    summary: 'Get Drawn Numbers (Socket Mock)',
    description: `
    **Socket Namespace:** \`/rooms\`
    
    **Send Event:** \`numberDrawnRequest\`
    - Data: \`{ activeRoomId: number }\`
    
    **Receive Event:** \`numberDrawn\`
    - Data: All drawn numbers for the specified active room
    
    **Socket Connection:**
    \`\`\`javascript
    const socket = io('http://localhost:3006/rooms');
    
    socket.emit('numberDrawnRequest', { activeRoomId: 1 });
    
    socket.on('numberDrawn', (data) => {
      console.log('Drawn Numbers:', data.data.drawnNumbers);
      console.log('Total Drawn:', data.data.totalDrawnNumbers);
      console.log('Last Number:', data.data.number);
      // Response format:
      // {
      //   "namespace": "/rooms",
      //   "event": "numberDrawn",
      //   "data": {
      //     "activeRoomId": 1,
      //     "number": 42,
      //     "totalDrawnNumbers": 17,
      //     "drawnNumbers": [12, 45, 3, 78, 22, ...]
      //   }
      // }
    });
    \`\`\`
    
    **Response Format:**
    \`\`\`json
    {
      "namespace": "/rooms",
      "event": "numberDrawn",
      "data": {
        "activeRoomId": 1,
        "number": 42,
        "totalDrawnNumbers": 17,
        "drawnNumbers": [12, 45, 3, 78, 22]
      }
    }
    \`\`\`
    `,
  })
  @ApiQuery({
    name: 'activeRoomId',
    required: true,
    type: 'number',
    description: 'Active room ID to get drawn numbers for',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'All drawn numbers for the specified active room',
    schema: {
      type: 'object',
      properties: {
        namespace: { type: 'string', example: '/rooms' },
        event: { type: 'string', example: 'numberDrawn' },
        data: {
          type: 'object',
          properties: {
            activeRoomId: { type: 'number', example: 1 },
            number: { type: 'number', example: 42 },
            totalDrawnNumbers: { type: 'number', example: 17 },
            drawnNumbers: {
              type: 'array',
              items: { type: 'number' },
              example: [12, 45, 3, 78, 22],
            },
          },
        },
      },
    },
  })
  async getDrawnNumbers(@Query('activeRoomId', ParseIntPipe) activeRoomId: number): Promise<{
    namespace: string;
    event: string;
    data: {
      activeRoomId: number;
      number: number | null;
      totalDrawnNumbers: number;
      drawnNumbers: number[];
    };
  }> {
    // Validation: Check if activeRoomId is provided and valid
    if (!activeRoomId || activeRoomId <= 0 || !Number.isInteger(activeRoomId)) {
      throw new BadRequestException('activeRoomId is required and must be a positive integer');
    }

    try {
      // Ensure room is started
      const roomInfo = await this.roomsService.getRoomInfo(activeRoomId);
      if (roomInfo.status !== 'started') {
        throw new BadRequestException('Room is not started');
      }

      // Get real data from socket service
      const { drawnNumbers, total } =
        await this.roomsService.getDrawnNumbers(activeRoomId);
      const lastNumber =
        drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;

      return {
        namespace: '/rooms',
        event: 'numberDrawn',
        data: {
          activeRoomId,
          number: lastNumber,
          totalDrawnNumbers: total,
          drawnNumbers,
        },
      };
    } catch (error) {
      // Fallback to mock data if real service fails
      return {
        namespace: '/rooms',
        event: 'numberDrawn',
        data: {
          activeRoomId,
          number: 42,
          totalDrawnNumbers: 5,
          drawnNumbers: [12, 45, 3, 78, 22],
        },
      };
    }
  }

  @Get('win')
  @ApiOperation({
    summary: 'Get Winners (Socket Mock)',
    description: `
    **Socket Namespace:** \`/rooms\`
    
    **Send Event:** \`winRequest\`
    - Data: \`{ activeRoomId: number }\`
    
    **Receive Event:** \`win\`
    - Data: Winners information including line winners, full winners, and game status
    
    **Socket Connection:**
    \`\`\`javascript
    const socket = io('http://localhost:3006/rooms');
    
    socket.emit('winRequest', { activeRoomId: 1 });
    
    socket.on('win', (data) => {
      console.log('Line Winners:', data.data.lineWinners);
      console.log('Full Winners:', data.data.fullWinners);
      console.log('Game Finished:', data.data.gameFinished);
      // Response format:
      // {
      //   "namespace": "/rooms",
      //   "event": "win",
      //   "data": {
      //     "activeRoomId": 1,
      //     "lineWinners": [
      //       {
      //         "userId": 123,
      //         "cardId": 456,
      //         "amount": 50000
      //       }
      //     ],
      //     "fullWinners": [
      //       {
      //         "userId": 789,
      //         "cardId": 654,
      //         "amount": 150000
      //       }
      //     ],
      //     "gameFinished": true
      //   }
      // }
    });
    \`\`\`
    
    **Response Format:**
    \`\`\`json
    {
      "namespace": "/rooms",
      "event": "win",
      "data": {
        "activeRoomId": 1,
        "lineWinners": [
          {
            "userId": 123,
            "cardId": 456,
            "amount": 50000
          }
        ],
        "fullWinners": [
          {
            "userId": 789,
            "cardId": 654,
            "amount": 150000
          }
        ],
        "gameFinished": true
      }
    }
    \`\`\`
    `,
  })
  @ApiQuery({
    name: 'activeRoomId',
    required: true,
    type: 'number',
    description: 'Active room ID to get winners for',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Winners information including line winners, full winners, and game status',
    schema: {
      type: 'object',
      properties: {
        namespace: { type: 'string', example: '/rooms' },
        event: { type: 'string', example: 'win' },
        data: {
          type: 'object',
          properties: {
            activeRoomId: { type: 'number', example: 1 },
            lineWinners: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'number', example: 123 },
                  cardId: { type: 'number', example: 456 },
                  amount: { type: 'number', example: 50000 },
                },
              },
            },
            fullWinners: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'number', example: 789 },
                  cardId: { type: 'number', example: 654 },
                  amount: { type: 'number', example: 150000 },
                },
              },
            },
            gameFinished: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  async getWinners(@Query('activeRoomId', ParseIntPipe) activeRoomId: number): Promise<{
    namespace: string;
    event: string;
    data: {
      activeRoomId: number;
      lineWinners: Array<{ userId: number; cardId: number; amount: number }>;
      fullWinners: Array<{ userId: number; cardId: number; amount: number }>;
      gameFinished: boolean;
    };
  }> {
    // Validation: Check if activeRoomId is provided and valid
    if (!activeRoomId || activeRoomId <= 0 || !Number.isInteger(activeRoomId)) {
      throw new BadRequestException('activeRoomId is required and must be a positive integer');
    }

    try {
      // Get real data from socket service
      const winners = await this.roomsService.getWinners(activeRoomId);

      return {
        namespace: '/rooms',
        event: 'win',
        data: {
          activeRoomId,
          lineWinners: winners.lineWinners,
          fullWinners: winners.fullWinners,
          gameFinished: winners.gameFinished,
        },
      };
    } catch (error) {
      // Fallback to mock data if real service fails
      return {
        namespace: '/rooms',
        event: 'win',
        data: {
          activeRoomId,
          lineWinners: [
            {
              userId: 123,
              cardId: 456,
              amount: 50000,
            },
          ],
          fullWinners: [
            {
              userId: 789,
              cardId: 654,
              amount: 150000,
            },
          ],
          gameFinished: true,
        },
      };
    }
  }
}
