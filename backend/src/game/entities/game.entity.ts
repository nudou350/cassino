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
  SLOT = 'slot',
  BLACKJACK = 'blackjack',
  ROULETTE = 'roulette',
  BACCARAT = 'baccarat',
  POKER = 'poker',
  CRAPS = 'craps',
  SCRATCH_CARD = 'scratch_card',
  KENO = 'keno',
  BINGO = 'bingo',
}

export enum Volatility {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
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
