import { Game } from '../entities/game.entity';

export interface GameLaunchData {
  launchUrl: string;
  sessionId?: string;
  token?: string;
  gameId: string;
  configuration?: Record<string, any>;
}

export interface ProviderGameData {
  externalId: string;
  name: string;
  type: string;
  thumbnailUrl?: string;
  demoAvailable: boolean;
  rtpPercentage?: number;
  volatility?: string;
  minBet?: number;
  maxBet?: number;
  description?: string;
  launchUrl?: string;
  configuration?: Record<string, any>;
}

export interface ProviderBalance {
  balance: number;
  currency: string;
}

export interface GameBetResult {
  success: boolean;
  balance: number;
  transactionId?: string;
  error?: string;
}

export interface IGameProvider {
  /**
   * Get provider code
   */
  getCode(): string;

  /**
   * Fetch all available games from the provider
   */
  fetchGames(): Promise<ProviderGameData[]>;

  /**
   * Launch a game and get the launch URL
   */
  launchGame(
    gameId: string,
    userId: string,
    demo: boolean,
    returnUrl?: string,
  ): Promise<GameLaunchData>;

  /**
   * Get player balance (if provider manages balance separately)
   */
  getBalance?(userId: string): Promise<ProviderBalance>;

  /**
   * Handle provider callbacks/webhooks
   */
  handleCallback?(data: any): Promise<any>;

  /**
   * Validate provider configuration
   */
  validateConfig(): Promise<boolean>;
}
