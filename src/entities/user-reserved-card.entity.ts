import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ActiveRoomGlobal } from './active-room-global.entity';
import { Card } from './card.entity';

@Entity('user_reserved_cards')
@Unique('UQ_user_activeCard', ['userId', 'activeRoomId', 'cardId'])
export class UserReservedCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  activeRoomId: number;

  @Column({ type: 'integer', nullable: false })
  cardId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ActiveRoomGlobal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activeRoomId' })
  activeRoom: ActiveRoomGlobal;

  @ManyToOne(() => Card, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId' })
  card: Card;
}
