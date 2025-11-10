import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Transaction } from '../../wallet/entities/transaction.entity';
import { GameSession } from '../../game/entities/game-session.entity';
import { Bonus } from '../../bonus/entities/bonus.entity';

export enum KycStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.PENDING,
  })
  kycStatus: KycStatus;

  @Column({ type: 'jsonb', nullable: true })
  kycDocuments: any;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonusBalance: number;

  @Column({ type: 'int', default: 1 })
  vipLevel: number;

  @Column({ type: 'timestamp', nullable: true })
  selfExcludedUntil: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date;

  // Responsible gaming limits
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyDepositLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weeklyDepositLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyDepositLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyLossLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weeklyLossLimit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monthlyLossLimit: number;

  @Column({ type: 'int', nullable: true })
  sessionTimeLimit: number; // in minutes

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => GameSession, (gameSession) => gameSession.user)
  gameSessions: GameSession[];

  @OneToMany(() => Bonus, (bonus) => bonus.user)
  bonuses: Bonus[];
}
