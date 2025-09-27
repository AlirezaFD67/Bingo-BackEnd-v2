import { ApiProperty } from '@nestjs/swagger';

export class PendingRoomMockDto {
  @ApiProperty({
    description: 'Active room ID',
    example: 1,
  })
  activeRoomId: number;

  @ApiProperty({
    description: 'Game room ID',
    example: 1,
  })
  gameRoomId: number;

  @ApiProperty({
    description: 'Remaining seconds until timer expires',
    example: 80,
  })
  remainingSeconds: number;

  @ApiProperty({
    description: 'Current player count',
    example: 3,
  })
  playerCount: number;

  @ApiProperty({
    description: 'Entry fee for the room',
    example: 100000,
  })
  entryFee: number;

  @ApiProperty({
    description: 'Room status',
    enum: ['pending', 'started'],
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Minimum players required to start',
    example: 3,
  })
  minPlayers: number;
}

export class PendingRoomsMockResponseDto {
  @ApiProperty({
    type: [PendingRoomMockDto],
    description: 'List of pending/started rooms',
    example: [
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
    ],
  })
  rooms: PendingRoomMockDto[];
}
