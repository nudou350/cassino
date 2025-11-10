import { Injectable } from '@nestjs/common';
import { ProvablyFairService } from '../provably-fair.service';
import { Game } from '../entities/game.entity';

@Injectable()
export class ScratchCardService {
  private readonly symbols = ['🍒', '🍋', '💎', '⭐', '🎁', '💰'];
  private readonly symbolWeights = [30, 25, 20, 15, 7, 3]; // Percentage weights

  constructor(private provablyFairService: ProvablyFairService) {}

  async play(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    betAmount: number,
    game: Game,
  ): Promise<{ outcome: any; payout: number }> {
    // Generate 9 symbols for 3x3 grid
    const squares: string[] = [];
    let currentNonce = nonce;

    for (let i = 0; i < 9; i++) {
      const symbol = this.getWeightedSymbol(
        serverSeed,
        clientSeed,
        currentNonce++,
      );
      squares.push(symbol);
    }

    // Check for wins
    const { isWin, matchCount, matchedSymbol, multiplier } =
      this.checkWin(squares);
    const payout = isWin ? betAmount * multiplier : 0;

    return {
      outcome: {
        squares,
        isWin,
        matchCount,
        matchedSymbol,
        multiplier,
      },
      payout,
    };
  }

  private getWeightedSymbol(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): string {
    const random = this.provablyFairService.generateNumber(
      serverSeed,
      clientSeed,
      nonce,
      1,
      100,
    );

    let cumulative = 0;
    for (let i = 0; i < this.symbolWeights.length; i++) {
      cumulative += this.symbolWeights[i];
      if (random <= cumulative) {
        return this.symbols[i];
      }
    }

    return this.symbols[0]; // Fallback
  }

  private checkWin(squares: string[]): {
    isWin: boolean;
    matchCount: number;
    matchedSymbol: string | null;
    multiplier: number;
  } {
    // Count occurrences of each symbol
    const symbolCounts = new Map<string, number>();
    squares.forEach((symbol) => {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    });

    // Find the symbol with most matches
    let maxMatches = 0;
    let matchedSymbol: string | null = null;

    symbolCounts.forEach((count, symbol) => {
      if (count > maxMatches) {
        maxMatches = count;
        matchedSymbol = symbol;
      }
    });

    // Win requires at least 3 matching symbols
    if (maxMatches >= 3) {
      const multiplier = this.getWinMultiplier(matchedSymbol, maxMatches);
      return {
        isWin: true,
        matchCount: maxMatches,
        matchedSymbol,
        multiplier,
      };
    }

    return {
      isWin: false,
      matchCount: 0,
      matchedSymbol: null,
      multiplier: 0,
    };
  }

  private getWinMultiplier(symbol: string, matchCount: number): number {
    // Base multipliers for symbols
    const baseMultipliers = {
      '🍒': 2,
      '🍋': 3,
      '💎': 5,
      '⭐': 8,
      '🎁': 15,
      '💰': 25,
    };

    const baseMultiplier = baseMultipliers[symbol] || 1;

    // Bonus for matching more symbols
    const matchBonus = {
      3: 1, // 3 matches: base multiplier
      4: 1.5, // 4 matches: 1.5x base
      5: 2, // 5 matches: 2x base
      6: 3, // 6 matches: 3x base
      7: 4, // 7 matches: 4x base
      8: 6, // 8 matches: 6x base
      9: 10, // 9 matches (all): 10x base
    };

    return baseMultiplier * (matchBonus[matchCount] || 1);
  }
}
