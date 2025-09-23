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

export enum ActiveRoomStatus {
  PENDING = 'pending',
  STARTED = 'started',
  FINISHED = 'finished',
  DEACTIVATED = 'deactivated',
}

@Entity('active_room_global')
export class ActiveRoomGlobal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  gameRoomId: number;

  @Column({ type: 'timestamp', nullable: false })
  startTime: Date;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: ActiveRoomStatus.PENDING,
  })
  status: ActiveRoomStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GameRoom, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gameRoomId' })
  gameRoom: GameRoom;
}

