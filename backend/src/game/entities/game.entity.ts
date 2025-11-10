import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GameSession } from './game-session.entity';

export enum GameType {
  SLOT = 'SLOT',
  BLACKJACK = 'BLACKJACK',
  ROULETTE = 'ROULETTE',
  BACCARAT = 'BACCARAT',
  POKER = 'POKER',
  CRAPS = 'CRAPS',
  SCRATCH_CARD = 'SCRATCH_CARD',
  KENO = 'KENO',
  BINGO = 'BINGO',
}

export enum Volatility {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: GameType,
  })
  type: GameType;

  @Column({ nullable: true })
  provider: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  rtpPercentage: number; // Return to Player percentage

  @Column({
    type: 'enum',
    enum: Volatility,
    default: Volatility.MEDIUM,
  })
  volatility: Volatility;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  minBet: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  maxBet: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: true })
  demoAvailable: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration: any; // Game-specific configuration

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => GameSession, (gameSession) => gameSession.game)
  sessions: GameSession[];
}
