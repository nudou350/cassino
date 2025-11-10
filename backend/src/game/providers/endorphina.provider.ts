import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BaseGameProvider } from './base-provider';
import {
  GameLaunchData,
  ProviderGameData,
} from '../interfaces/game-provider.interface';
import { Provider } from '../entities/provider.entity';
import * as crypto from 'crypto';

@Injectable()
export class EndorphinaProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'ENDORPHINA';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching Endorphina games');

      const mockGames: ProviderGameData[] = [
        {
          externalId: 'endorphina-hell-hot-100',
          name: 'Hell Hot 100',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.endorphina.com/games/hell-hot-100.jpg',
          demoAvailable: true,
          rtpPercentage: 96.0,
          volatility: 'MEDIUM',
          minBet: 1,
          maxBet: 1000,
          description: 'Classic fruit slot with 100 paylines',
        },
        {
          externalId: 'endorphina-twerk',
          name: 'Twerk',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.endorphina.com/games/twerk.jpg',
          demoAvailable: true,
          rtpPercentage: 96.0,
          volatility: 'MEDIUM',
          minBet: 0.01,
          maxBet: 200,
          description: 'Party themed slot with free spins',
        },
        {
          externalId: 'endorphina-lucky-streak-3',
          name: 'Lucky Streak 3',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.endorphina.com/games/lucky-streak.jpg',
          demoAvailable: true,
          rtpPercentage: 96.0,
          volatility: 'LOW',
          minBet: 0.05,
          maxBet: 50,
          description: 'Classic 3-reel slot with risk game',
        },
        {
          externalId: 'endorphina-safari',
          name: 'Safari',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.endorphina.com/games/safari.jpg',
          demoAvailable: true,
          rtpPercentage: 96.0,
          volatility: 'MEDIUM',
          minBet: 0.01,
          maxBet: 100,
          description: 'African safari theme with free spins',
        },
        {
          externalId: 'endorphina-book-of-rest',
          name: 'Book of Rest',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.endorphina.com/games/book-of-rest.jpg',
          demoAvailable: true,
          rtpPercentage: 96.0,
          volatility: 'HIGH',
          minBet: 0.01,
          maxBet: 100,
          description: 'Egyptian theme with expanding symbols',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch Endorphina games', error);
      throw error;
    }
  }

  async launchGame(
    gameId: string,
    userId: string,
    demo: boolean,
    returnUrl?: string,
  ): Promise<GameLaunchData> {
    try {
      this.logger.log(`Launching Endorphina game: ${gameId} for user: ${userId}`);

      const sessionToken = this.generateSessionToken(userId, gameId);
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'Endorphina',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch Endorphina game', error);
      throw error;
    }
  }

  private generateSessionToken(userId: string, gameId: string): string {
    const timestamp = Date.now();
    const data = `${userId}-${gameId}-${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private buildLaunchUrl(
    gameId: string,
    token: string,
    demo: boolean,
    returnUrl?: string,
  ): string {
    const baseUrl = this.provider.configuration?.launchBaseUrl ||
                    'https://game.endorphina.com/';

    const params = new URLSearchParams({
      game: gameId,
      partner: this.provider.operatorId || 'casino',
      token,
      mode: demo ? 'demo' : 'real',
      lang: 'en',
      ...(returnUrl && { exit_url: returnUrl }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling Endorphina callback', data);
    return {
      success: true,
      message: 'Callback processed',
    };
  }
}
