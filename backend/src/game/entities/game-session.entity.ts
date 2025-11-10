import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Game } from './game.entity';

@Entity('game_sessions')
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.gameSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Game, (game) => game.sessions)
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  betAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  payoutAmount: number;

  @Column({ type: 'jsonb' })
  outcomeData: any; // Store game-specific outcome data

  @Column()
  provablyFairSeed: string; // For provably fair verification

  @Column({ nullable: true })
  clientSeed: string;

  @Column({ nullable: true })
  serverSeed: string;

  @Column({ type: 'bigint', nullable: true })
  nonce: number;

  @Column({ default: false })
  isDemo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
