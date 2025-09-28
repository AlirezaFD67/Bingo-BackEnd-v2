import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { RoomType } from '../enums/room-type.enum';

@Entity('game_rooms')
export class GameRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  entryFee: number;

  @Column({ type: 'integer' })
  startTimer: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer' })
  type: RoomType;

  @Column({ type: 'integer' })
  minPlayers: number;

  @CreateDateColumn()
  createdAt: Date;
}
