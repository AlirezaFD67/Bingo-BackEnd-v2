import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ unique: true, nullable: false })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;

  @Column({ type: 'bigint', default: 0, nullable: false })
  walletBalance: number;

  @Column({ nullable: true })
  bankCardNumber?: string;

  @Column({ length: 26, nullable: true })
  shebaNumber?: string;

  @Column({ length: 6, unique: true, nullable: true })
  referralCode?: string;

  @Column({ length: 6, nullable: true })
  referredBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
