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
export class YggdrasilProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'YGGDRASIL';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching Yggdrasil games');

      const mockGames: ProviderGameData[] = [
        {
          externalId: 'yggdrasil-vikings-go-berzerk',
          name: 'Vikings Go Berzerk',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.yggdrasilgaming.com/games/vikings-berzerk.jpg',
          demoAvailable: true,
          rtpPercentage: 96.1,
          volatility: 'HIGH',
          minBet: 0.25,
          maxBet: 125,
          description: 'Viking warriors with rage mode and free spins',
        },
        {
          externalId: 'yggdrasil-valley-of-the-gods',
          name: 'Valley of the Gods',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.yggdrasilgaming.com/games/valley-gods.jpg',
          demoAvailable: true,
          rtpPercentage: 96.2,
          volatility: 'MEDIUM',
          minBet: 0.1,
          maxBet: 100,
          description: 'Ancient Egypt with re-spins and multipliers',
        },
        {
          externalId: 'yggdrasil-golden-fishtank',
          name: 'Golden Fish Tank',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.yggdrasilgaming.com/games/golden-fish.jpg',
          demoAvailable: true,
          rtpPercentage: 96.3,
          volatility: 'MEDIUM',
          minBet: 0.2,
          maxBet: 100,
          description: 'Underwater adventure with sticky wilds',
        },
        {
          externalId: 'yggdrasil-holmes-stolen-stones',
          name: 'Holmes and the Stolen Stones',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.yggdrasilgaming.com/games/holmes.jpg',
          demoAvailable: true,
          rtpPercentage: 96.8,
          volatility: 'MEDIUM',
          minBet: 0.2,
          maxBet: 100,
          description: 'Detective mystery with free spins',
        },
        {
          externalId: 'yggdrasil-rainbow-ryan',
          name: 'Rainbow Ryan',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.yggdrasilgaming.com/games/rainbow-ryan.jpg',
          demoAvailable: true,
          rtpPercentage: 96.3,
          volatility: 'MEDIUM',
          minBet: 0.2,
          maxBet: 100,
          description: 'Irish leprechaun with rainbow wilds',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch Yggdrasil games', error);
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
      this.logger.log(`Launching Yggdrasil game: ${gameId} for user: ${userId}`);

      const sessionToken = this.generateSessionToken(userId, gameId);
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'Yggdrasil',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch Yggdrasil game', error);
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
                    'https://launcher.yggdrasilgaming.com/';

    const params = new URLSearchParams({
      game: gameId,
      operator: this.provider.operatorId || 'casino',
      token,
      mode: demo ? 'fun' : 'real',
      lang: 'en',
      currency: 'USD',
      ...(returnUrl && { lobby_url: returnUrl }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling Yggdrasil callback', data);
    return {
      success: true,
      message: 'Callback processed',
    };
  }
}
