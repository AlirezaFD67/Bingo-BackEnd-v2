import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  cardCount: number;

  @Column({ type: 'bigint', nullable: false })
  entryFee: number;

  @Column({ type: 'integer', nullable: true })
  activeRoomId?: number;

  @Column({
    type: 'varchar',
    default: ReservationStatus.PENDING,
    nullable: false,
  })
  status: ReservationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

