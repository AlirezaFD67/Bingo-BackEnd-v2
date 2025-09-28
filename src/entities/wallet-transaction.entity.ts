import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../enums/transaction-type.enum';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'bigint', nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: false,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.CONFIRMED,
    nullable: false,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  // رابطه با کاربر
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
