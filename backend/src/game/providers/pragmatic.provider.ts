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
export class PragmaticProvider extends BaseGameProvider {
  constructor(provider: Provider, httpService: HttpService) {
    super(provider, httpService);
  }

  getCode(): string {
    return 'PRAGMATIC';
  }

  async fetchGames(): Promise<ProviderGameData[]> {
    try {
      this.logger.log('Fetching Pragmatic Play games');

      // Mock list of popular Pragmatic Play games
      const mockGames: ProviderGameData[] = [
        {
          externalId: 'pragmatic-gates-olympus',
          name: 'Gates of Olympus',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/gates-olympus.jpg',
          demoAvailable: true,
          rtpPercentage: 96.5,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 125,
          description: 'Tumble through Greek mythology with Zeus multipliers',
        },
        {
          externalId: 'pragmatic-sweet-bonanza',
          name: 'Sweet Bonanza',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/sweet-bonanza.jpg',
          demoAvailable: true,
          rtpPercentage: 96.51,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 125,
          description: 'Tumble wins with sweet multipliers up to 100x',
        },
        {
          externalId: 'pragmatic-starlight-princess',
          name: 'Starlight Princess',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/starlight-princess.jpg',
          demoAvailable: true,
          rtpPercentage: 96.5,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 125,
          description: 'Anime-style princess with tumbling reels and multipliers',
        },
        {
          externalId: 'pragmatic-sugar-rush',
          name: 'Sugar Rush',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/sugar-rush.jpg',
          demoAvailable: true,
          rtpPercentage: 96.5,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 125,
          description: 'Cluster pays with sweet multiplier features',
        },
        {
          externalId: 'pragmatic-dog-house',
          name: 'The Dog House',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/dog-house.jpg',
          demoAvailable: true,
          rtpPercentage: 96.51,
          volatility: 'MEDIUM',
          minBet: 0.2,
          maxBet: 100,
          description: 'Adorable dogs with sticky wilds and free spins',
        },
        {
          externalId: 'pragmatic-wolf-gold',
          name: 'Wolf Gold',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/wolf-gold.jpg',
          demoAvailable: true,
          rtpPercentage: 96.01,
          volatility: 'MEDIUM',
          minBet: 0.25,
          maxBet: 125,
          description: 'Classic slot with Money Respin jackpot feature',
        },
        {
          externalId: 'pragmatic-buffalo-king',
          name: 'Buffalo King Megaways',
          type: 'SLOT',
          thumbnailUrl: 'https://cdn.pragmaticplay.com/games/buffalo-king.jpg',
          demoAvailable: true,
          rtpPercentage: 96.06,
          volatility: 'HIGH',
          minBet: 0.2,
          maxBet: 100,
          description: 'Megaways mechanic with up to 200,704 ways to win',
        },
      ];

      return mockGames;
    } catch (error) {
      this.logger.error('Failed to fetch Pragmatic Play games', error);
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
      this.logger.log(`Launching Pragmatic Play game: ${gameId} for user: ${userId}`);

      const sessionToken = this.generateSessionToken(userId, gameId);
      const launchUrl = this.buildLaunchUrl(gameId, sessionToken, demo, returnUrl);

      return {
        launchUrl,
        sessionId: sessionToken,
        token: sessionToken,
        gameId,
        configuration: {
          provider: 'Pragmatic Play',
          demo,
        },
      };
    } catch (error) {
      this.logger.error('Failed to launch Pragmatic Play game', error);
      throw error;
    }
  }

  private generateSessionToken(userId: string, gameId: string): string {
    const timestamp = Date.now();
    const data = `${userId}-${gameId}-${timestamp}-${this.provider.apiKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private buildLaunchUrl(
    gameId: string,
    token: string,
    demo: boolean,
    returnUrl?: string,
  ): string {
    const baseUrl = this.provider.configuration?.launchBaseUrl ||
                    'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do';

    const params = new URLSearchParams({
      gameSymbol: gameId,
      websiteUrl: this.provider.configuration?.websiteUrl || 'casino.com',
      jurisdiction: this.provider.configuration?.jurisdiction || '99',
      lobby_url: returnUrl || 'https://casino.com',
      lang: 'en',
      cur: 'USD',
      ...(demo ? { technology: 'H5' } : { token }),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(data: any): Promise<any> {
    this.logger.log('Handling Pragmatic Play callback', data);

    // Implement Pragmatic Play specific callback logic
    // Handle balance checks, bet placements, win notifications, etc.

    return {
      success: true,
      balance: 0, // Would fetch actual balance
      message: 'Callback processed',
    };
  }
}
