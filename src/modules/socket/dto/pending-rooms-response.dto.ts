import { ApiProperty } from '@nestjs/swagger';

export class PendingRoomDto {
  @ApiProperty({ description: 'Active room ID' })
  activeRoomId: number;

  @ApiProperty({ description: 'Game room ID' })
  gameRoomId: number;

  @ApiProperty({ description: 'Remaining seconds until timer expires' })
  remainingSeconds: number;

  @ApiProperty({ description: 'Current player count' })
  playerCount: number;

  @ApiProperty({ description: 'Entry fee for the room' })
  entryFee: number;

  @ApiProperty({ description: 'Room status', enum: ['pending', 'started'] })
  status: string;

  @ApiProperty({ description: 'Minimum players required to start' })
  minPlayers: number;
}

export class PendingRoomsResponseDto {
  @ApiProperty({ type: [PendingRoomDto], description: 'List of pending/started rooms' })
  rooms: PendingRoomDto[];
}
