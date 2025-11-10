export interface Game {
  id: string;
  name: string;
  type: 'SLOT' | 'BLACKJACK' | 'ROULETTE' | 'SCRATCH_CARD' | 'KENO' | 'BACCARAT' | 'POKER' | 'OTHER';
  provider: string;
  rtpPercentage: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  minBet: number;
  maxBet: number;
  thumbnailUrl: string;
  description: string;
  isActive: boolean;
  demoAvailable: boolean;
}

export interface PlayGameRequest {
  gameId: string;
  betAmount: number;
  isDemo?: boolean;
  gameData?: any; // Game-specific data (e.g., roulette bet type)
}

export interface GameResult {
  sessionId: string;
  betAmount: number;
  payoutAmount: number;
  payout: number; // Alias for payoutAmount for easier use
  outcome: any; // Game-specific outcome data
  newBalance: number;
  provablyFair: {
    serverSeed: string;
    clientSeed: string;
    nonce: number;
  };
}

export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  betAmount: number;
  payoutAmount: number;
  outcome: any;
  outcomeData?: any; // Alias for outcome
  isDemo: boolean;
  createdAt: string;
}
