import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
