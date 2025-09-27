import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GameRoom } from './game-room.entity';
import { RoomStatus } from '../enums/room-status.enum';

@Entity('active_room_global')
export class ActiveRoomGlobal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  gameRoomId: number;

  @Column({ type: 'integer', nullable: false })
  remainingSeconds: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: RoomStatus.PENDING,
    nullable: false,
  })
  status: RoomStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GameRoom, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gameRoomId' })
  gameRoom: GameRoom;
}
