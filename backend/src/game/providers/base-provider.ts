import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import {
  IGameProvider,
  GameLaunchData,
  ProviderGameData,
  ProviderBalance,
} from '../interfaces/game-provider.interface';
import { Provider } from '../entities/provider.entity';

export abstract class BaseGameProvider implements IGameProvider {
  protected readonly logger: Logger;
  protected readonly httpService: HttpService;

  constructor(
    protected readonly provider: Provider,
    httpService: HttpService,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.httpService = httpService;
  }

  abstract getCode(): string;
  abstract fetchGames(): Promise<ProviderGameData[]>;
  abstract launchGame(
    gameId: string,
    userId: string,
    demo: boolean,
    returnUrl?: string,
  ): Promise<GameLaunchData>;

  getBalance?(userId: string): Promise<ProviderBalance>;
  handleCallback?(data: any): Promise<any>;

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.provider.apiEndpoint) {
        this.logger.warn('API endpoint not configured');
        return false;
      }
      if (!this.provider.apiKey) {
        this.logger.warn('API key not configured');
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error('Config validation failed', error);
      return false;
    }
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.provider.apiKey}`,
    };
  }

  protected async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
  ): Promise<T> {
    try {
      const url = `${this.provider.apiEndpoint}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
      };

      let response;
      switch (method) {
        case 'GET':
          response = await this.httpService.axiosRef.get(url, config);
          break;
        case 'POST':
          response = await this.httpService.axiosRef.post(url, data, config);
          break;
        case 'PUT':
          response = await this.httpService.axiosRef.put(url, data, config);
          break;
        case 'DELETE':
          response = await this.httpService.axiosRef.delete(url, config);
          break;
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }
}
