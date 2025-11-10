import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Game } from './game.entity';

export enum ProviderType {
  SLOTS = 'SLOTS',
  LIVE_CASINO = 'LIVE_CASINO',
  BOTH = 'BOTH',
  IN_HOUSE = 'IN_HOUSE',
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.SLOTS,
  })
  type: ProviderType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  apiEndpoint: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ nullable: true })
  apiSecret: string;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Game, (game) => game.providerEntity)
  games: Game[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
