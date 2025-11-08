import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameType } from './entities/game.entity';
import { GameSession } from './entities/game-session.entity';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';
import { ProvablyFairService } from './provably-fair.service';
import { SlotGameService } from './services/slot-game.service';
import { BlackjackService } from './services/blackjack.service';
import { RouletteService } from './services/roulette.service';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @InjectRepository(GameSession)
    private sessionRepository: Repository<GameSession>,
    private userService: UserService,
    private walletService: WalletService,
    private provablyFairService: ProvablyFairService,
    private slotGameService: SlotGameService,
    private blackjackService: BlackjackService,
    private rouletteService: RouletteService,
  ) {}

  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getGameById(gameId: string): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId, isActive: true },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async playGame(
    userId: string,
    gameId: string,
    betAmount: number,
    clientSeed?: string,
    isDemo: boolean = false,
  ): Promise<{
    session: GameSession;
    outcome: any;
    payout: number;
    balance: number;
  }> {
    const game = await this.getGameById(gameId);
    const user = await this.userService.findById(userId);

    // Validate bet amount
    if (betAmount < Number(game.minBet) || betAmount > Number(game.maxBet)) {
      throw new BadRequestException(
        `Bet amount must be between ${game.minBet} and ${game.maxBet}`,
      );
    }

    // Check demo mode
    if (isDemo && !game.demoAvailable) {
      throw new BadRequestException('Demo mode not available for this game');
    }

    // Check balance (skip for demo)
    if (!isDemo && Number(user.balance) < betAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Generate provably fair seeds
    const serverSeed = this.provablyFairService.generateServerSeed();
    const effectiveClientSeed =
      clientSeed || this.provablyFairService.generateClientSeed();
    const nonce = Date.now();
    const combinedSeed =
      this.provablyFairService.createCombinedHash(
        serverSeed,
        effectiveClientSeed,
        nonce,
      );

    // Play the game based on type
    let outcome: any;
    let payout = 0;

    switch (game.type) {
      case GameType.SLOT:
        const slotResult = await this.slotGameService.spin(
          serverSeed,
          effectiveClientSeed,
          nonce,
          betAmount,
          game,
        );
        outcome = slotResult.outcome;
        payout = slotResult.payout;
        break;

      case GameType.BLACKJACK:
        const bjResult = await this.blackjackService.play(
          serverSeed,
          effectiveClientSeed,
          nonce,
          betAmount,
        );
        outcome = bjResult.outcome;
        payout = bjResult.payout;
        break;

      case GameType.ROULETTE:
        const rouletteResult = await this.rouletteService.spin(
          serverSeed,
          effectiveClientSeed,
          nonce,
          betAmount,
          { number: 0 }, // Default bet, should be passed from client
        );
        outcome = rouletteResult.outcome;
        payout = rouletteResult.payout;
        break;

      default:
        throw new BadRequestException('Game type not implemented');
    }

    // Record transaction (skip for demo)
    if (!isDemo) {
      await this.walletService.recordBet(userId, betAmount, gameId);
      if (payout > 0) {
        await this.walletService.recordWin(userId, payout, gameId);
      }
    }

    // Create game session
    const session = this.sessionRepository.create({
      userId,
      gameId,
      betAmount,
      payoutAmount: payout,
      outcomeData: outcome,
      provablyFairSeed: combinedSeed,
      clientSeed: effectiveClientSeed,
      serverSeed: serverSeed,
      nonce,
      isDemo,
    });

    const savedSession = await this.sessionRepository.save(session);

    // Get updated balance
    const updatedUser = await this.userService.findById(userId);

    return {
      session: savedSession,
      outcome,
      payout,
      balance: isDemo ? Number(user.balance) : Number(updatedUser.balance),
    };
  }

  async getGameHistory(
    userId: string,
    gameId?: string,
    limit: number = 50,
  ): Promise<GameSession[]> {
    const query: any = { userId };
    if (gameId) {
      query.gameId = gameId;
    }

    return await this.sessionRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['game'],
    });
  }

  async verifySession(sessionId: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.provablyFairService.verifyOutcome(
      session.serverSeed,
      session.clientSeed,
      session.nonce,
      session.provablyFairSeed,
    );
  }

  async seedDatabase(): Promise<void> {
    // Create some sample games
    const games = [
      {
        name: 'Lucky Sevens',
        type: GameType.SLOT,
        provider: 'House',
        rtpPercentage: 96.5,
        volatility: 'medium',
        minBet: 0.1,
        maxBet: 100,
        demoAvailable: true,
        description: 'Classic slot machine with lucky sevens',
      },
      {
        name: 'Classic Blackjack',
        type: GameType.BLACKJACK,
        provider: 'House',
        rtpPercentage: 99.5,
        volatility: 'low',
        minBet: 1,
        maxBet: 500,
        demoAvailable: true,
        description: 'Traditional blackjack game',
      },
      {
        name: 'European Roulette',
        type: GameType.ROULETTE,
        provider: 'House',
        rtpPercentage: 97.3,
        volatility: 'medium',
        minBet: 0.5,
        maxBet: 1000,
        demoAvailable: true,
        description: 'European roulette with single zero',
      },
    ];

    for (const gameData of games) {
      const existing = await this.gameRepository.findOne({
        where: { name: gameData.name },
      });
      if (!existing) {
        const game = this.gameRepository.create(gameData);
        await this.gameRepository.save(game);
      }
    }

    console.log('✅ Sample games seeded to database');
  }
}
