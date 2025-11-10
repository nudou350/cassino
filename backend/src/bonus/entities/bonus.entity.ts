import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum BonusType {
  WELCOME = 'welcome',
  DEPOSIT = 'deposit',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback',
  REFERRAL = 'referral',
  VIP = 'vip',
  TOURNAMENT = 'tournament',
}

export enum BonusStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('bonuses')
export class Bonus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bonuses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: BonusType,
  })
  type: BonusType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  wageringRequirement: number; // Amount that needs to be wagered

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  wageredAmount: number; // Amount already wagered

  @Column({
    type: 'enum',
    enum: BonusStatus,
    default: BonusStatus.ACTIVE,
  })
  status: BonusStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
