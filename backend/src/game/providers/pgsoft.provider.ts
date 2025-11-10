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
export class PGSoftProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'PGSOFT';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching PG Soft games');

      // In a real implementation, you would call the PG Soft API
      // For now, return a mock list of popular PG Soft games
      const mockGames: ProviderGameData[] = [
        {
          externalId: 'pgsoft-fortune-tiger',
          name: 'Fortune Tiger',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pgsoft.com/games/fortune-tiger.jpg',
          demoAvailable: true,
          rtpPercentage: 96.81,
          volatility: 'MEDIUM',
          minBet: 0.5,
          maxBet: 250,
          description: 'Fortune Tiger brings luck and prosperity with exciting features',
        },
        {
          externalId: 'pgsoft-fortune-ox',
          name: 'Fortune Ox',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pgsoft.com/games/fortune-ox.jpg',
          demoAvailable: true,
          rtpPercentage: 96.75,
          volatility: 'MEDIUM',
          minBet: 0.5,
          maxBet: 250,
          description: 'Fortune Ox delivers powerful wins with multiplier features',
        },
        {
          externalId: 'pgsoft-fortune-mouse',
          name: 'Fortune Mouse',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pgsoft.com/games/fortune-mouse.jpg',
          demoAvailable: true,
          rtpPercentage: 96.97,
          volatility: 'HIGH',
          minBet: 0.5,
          maxBet: 250,
          description: 'Fortune Mouse offers high volatility excitement',
        },
        {
          externalId: 'pgsoft-wild-bounty',
          name: 'Wild Bounty Showdown',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pgsoft.com/games/wild-bounty.jpg',
          demoAvailable: true,
          rtpPercentage: 96.79,
          volatility: 'HIGH',
          minBet: 0.5,
          maxBet: 300,
          description: 'Wild West themed slot with expanding wilds',
        },
        {
          externalId: 'pgsoft-ways-of-qilin',
          name: 'Ways of the Qilin',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pgsoft.com/games/ways-qilin.jpg',
          demoAvailable: true,
          rtpPercentage: 96.72,
          volatility: 'MEDIUM',
          minBet: 0.5,
          maxBet: 250,
          description: 'Asian mythology themed slot with free spins',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch PG Soft games', error);
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
      this.logger.log(`Launching PG Soft game: ${gameId} for user: ${userId}`);

      // Generate session token
      const sessionToken = this.generateSessionToken(userId, gameId);

      // In a real implementation, you would call PG Soft's game launch API
      // and get the actual launch URL. For now, return a mock URL
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'PG Soft',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch PG Soft game', error);
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
                    'https://m.pgsoft-games.com/';

    const params = new URLSearchParams({
      operator: this.provider.operatorId || 'casino',
      game: gameId,
      token,
      mode: demo ? 'demo' : 'real',
      language: 'en',
      ...(returnUrl && { return_url: returnUrl }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling PG Soft callback', data);

    // Implement callback logic based on PG Soft's API specification
    // This would typically handle bet placement, win notifications, etc.

    return {
      success: true,
      message: 'Callback processed',
    };
  }
}
