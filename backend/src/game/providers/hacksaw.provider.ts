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
export class HacksawProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'HACKSAW';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching Hacksaw Gaming games');

      const mockGames: ProviderGameData[] = [
        {
          externalId: 'hacksaw-wanted-dead-wild',
          name: 'Wanted Dead or a Wild',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.hacksaw.com/games/wanted-dead.jpg',
          demoAvailable: true,
          rtpPercentage: 96.38,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Western themed slot with expanding reels up to 12,500x',
        },
        {
          externalId: 'hacksaw-le-bandit',
          name: 'Le Bandit',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.hacksaw.com/games/le-bandit.jpg',
          demoAvailable: true,
          rtpPercentage: 96.34,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'French heist theme with expanding wilds and multipliers',
        },
        {
          externalId: 'hacksaw-chaos-crew',
          name: 'Chaos Crew',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.hacksaw.com/games/chaos-crew.jpg',
          demoAvailable: true,
          rtpPercentage: 96.3,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Alien invasion with increasing multipliers and cascades',
        },
        {
          externalId: 'hacksaw-stack-em',
          name: 'Stack Em',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.hacksaw.com/games/stack-em.jpg',
          demoAvailable: true,
          rtpPercentage: 96.26,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Stacking wilds with up to 20,000x max win',
        },
        {
          externalId: 'hacksaw-dual-reels',
          name: 'Dual Reels',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.hacksaw.com/games/dual-reels.jpg',
          demoAvailable: true,
          rtpPercentage: 96.31,
          volatility: 'MEDIUM',
          minBet: 0.2,
          maxBet: 100,
          description: 'Unique dual reel mechanic with multipliers',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch Hacksaw Gaming games', error);
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
      this.logger.log(`Launching Hacksaw Gaming game: ${gameId} for user: ${userId}`);

      const sessionToken = this.generateSessionToken(userId, gameId);
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'Hacksaw Gaming',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch Hacksaw Gaming game', error);
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
                    'https://loader-iframe.hacksaw.link/';

    const params = new URLSearchParams({
      game: gameId,
      partner: this.provider.operatorId || 'casino',
      token,
      mode: demo ? 'fun' : 'real',
      lang: 'en',
      currency: 'USD',
      ...(returnUrl && { exit_url: returnUrl }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling Hacksaw Gaming callback', data);
    return {
      success: true,
      message: 'Callback processed',
    };
  }
}
