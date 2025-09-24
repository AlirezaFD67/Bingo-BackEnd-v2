import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true, nullable: false })
  code: string;

  @Column({ type: 'json', nullable: false })
  matrix: number[][];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
