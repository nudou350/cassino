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
export class NoLimitProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'NOLIMIT';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching No Limit City games');

      const mockGames: ProviderGameData[] = [
        {
          externalId: 'nolimit-mental',
          name: 'Mental',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.nolimitcity.com/games/mental.jpg',
          demoAvailable: true,
          rtpPercentage: 96.06,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Asylum themed with xNudge and xWays features',
        },
        {
          externalId: 'nolimit-san-quentin',
          name: 'San Quentin xWays',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.nolimitcity.com/games/san-quentin.jpg',
          demoAvailable: true,
          rtpPercentage: 96.03,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Prison escape with up to 150,000x max win',
        },
        {
          externalId: 'nolimit-tombstone',
          name: 'Tombstone R.I.P',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.nolimitcity.com/games/tombstone-rip.jpg',
          demoAvailable: true,
          rtpPercentage: 96.08,
          volatility: 'HIGH',
          minBet: 0.1,
          maxBet: 100,
          description: 'Wild West with xNudge Wilds and multipliers',
        },
        {
          externalId: 'nolimit-fire-in-the-hole',
          name: 'Fire in the Hole xBomb',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.nolimitcity.com/games/fire-in-hole.jpg',
          demoAvailable: true,
          rtpPercentage: 96.06,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 16,
          description: 'Mining themed with xBomb multipliers and expanding reels',
        },
        {
          externalId: 'nolimit-deadwood',
          name: 'Deadwood',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.nolimitcity.com/games/deadwood.jpg',
          demoAvailable: true,
          rtpPercentage: 96.03,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Western classic with Shootout bonus',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch No Limit City games', error);
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
      this.logger.log(`Launching No Limit City game: ${gameId} for user: ${userId}`);

      const sessionToken = this.generateSessionToken(userId, gameId);
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'No Limit City',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch No Limit City game', error);
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
                    'https://game-launcher.nolimitcity.com/';

    const params = new URLSearchParams({
      game: gameId,
      operator: this.provider.operatorId || 'casino',
      token,
      mode: demo ? 'demo' : 'real',
      lang: 'en',
      ...(returnUrl && { return_url: returnUrl }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling No Limit City callback', data);
    return {
      success: true,
      message: 'Callback processed',
    };
  }
}
