import { ApiProperty } from '@nestjs/swagger';

export class OwnerDto {
  @ApiProperty({
    description: 'User ID',
    example: 10,
  })
  userId: number;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string;
}

export class RoomCardDto {
  @ApiProperty({
    description: 'Card ID',
    example: 1,
  })
  cardId: number;

  @ApiProperty({
    description: 'Card matrix',
    example: [
      [5, null, null, 37, null, null, 62, 78, 84],
      [null, 12, 24, 33, 41, 51, null, null, null],
      [null, 14, 27, null, 43, 52, 67, null, null],
    ],
  })
  matrix: (number | null)[][];

  @ApiProperty({
    description: 'Card owner information',
    type: OwnerDto,
  })
  owner: OwnerDto;

  @ApiProperty({
    description: 'Active room ID',
    example: 1,
  })
  activeRoomId: number;

  @ApiProperty({
    description: 'Reservation timestamp',
    example: '2024-06-20T12:34:56.789Z',
  })
  reservedAt: Date;
}
