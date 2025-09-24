import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ActiveRoomGlobal } from './active-room-global.entity';

@Entity('drawn_numbers')
export class DrawnNumber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  activeRoomId: number;

  @Column({ type: 'integer', nullable: false })
  number: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ActiveRoomGlobal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activeRoomId' })
  activeRoom: ActiveRoomGlobal;
}
