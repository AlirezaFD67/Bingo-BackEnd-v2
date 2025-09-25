import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ActiveRoomGlobal } from './active-room-global.entity';
import { Card } from './card.entity';

@Entity('active_room_winners')
export class ActiveRoomWinner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  activeRoomId: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  cardId: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  winType: 'line' | 'full';

  @CreateDateColumn({ name: 'winAt' })
  winAt: Date;

  @ManyToOne(() => ActiveRoomGlobal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activeRoomId' })
  activeRoom: ActiveRoomGlobal;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId' })
  card: Card;
}

