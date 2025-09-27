import { ApiProperty } from '@nestjs/swagger';

export class RoomInfoResponseDto {
  @ApiProperty({
    description: 'Room status',
    enum: ['pending', 'started', 'finished', 'deactivated'],
  })
  status: string;

  @ApiProperty({ description: 'Remaining seconds until timer expires' })
  remainingSeconds: number;

  @ApiProperty({
    description: 'Number of available cards (30 - reserved cards)',
  })
  availableCards: number;

  @ApiProperty({ description: 'Current player count in the room' })
  playerCount: number;
}
