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
export class PushGamingProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'PUSH';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching Push Gaming games');

      const mockGames: ProviderGameData[] = [
        {
          externalId: 'push-jammin-jars',
          name: 'Jammin Jars',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pushgaming.com/games/jammin-jars.jpg',
          demoAvailable: true,
          rtpPercentage: 96.83,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Cluster pays with rainbow feature and multipliers',
        },
        {
          externalId: 'push-razor-shark',
          name: 'Razor Shark',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pushgaming.com/games/razor-shark.jpg',
          demoAvailable: true,
          rtpPercentage: 96.7,
          volatility: 'HIGH',
          minBet: 0.1,
          maxBet: 100,
          description: 'Underwater theme with mystery stacks',
        },
        {
          externalId: 'push-fat-banker',
          name: 'Fat Banker',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pushgaming.com/games/fat-banker.jpg',
          demoAvailable: true,
          rtpPercentage: 96.21,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Banker theme with bonus features',
        },
        {
          externalId: 'push-big-bamboo',
          name: 'Big Bamboo',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pushgaming.com/games/big-bamboo.jpg',
          demoAvailable: true,
          rtpPercentage: 96.13,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Asian panda theme with mystery symbols',
        },
        {
          externalId: 'push-fat-rabbit',
          name: 'Fat Rabbit',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pushgaming.com/games/fat-rabbit.jpg',
          demoAvailable: true,
          rtpPercentage: 96.45,
          volatility: 'HIGH',
          minBet: 0.25,
          maxBet: 100,
          description: 'Farm themed with expanding reels up to 10x5',
        },
        {
          externalId: 'push-mount-mazuma',
          name: 'Mount Mazuma',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pushgaming.com/games/mount-mazuma.jpg',
          demoAvailable: true,
          rtpPercentage: 96.4,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Volcano themed with cascading wins',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch Push Gaming games', error);
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
      this.logger.log(`Launching Push Gaming game: ${gameId} for user: ${userId}`);

      const sessionToken = this.generateSessionToken(userId, gameId);
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'Push Gaming',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch Push Gaming game', error);
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
                    'https://games.pushgaming.com/';

    const params = new URLSearchParams({
      game: gameId,
      operator: this.provider.operatorId || 'casino',
      token,
      mode: demo ? 'demo' : 'real',
      lang: 'en',
      ...(returnUrl && { lobby_url: returnUrl }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling Push Gaming callback', data);
    return {
      success: true,
      message: 'Callback processed',
    };
  }
}
