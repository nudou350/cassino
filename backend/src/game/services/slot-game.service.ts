import { Injectable } from '@nestjs/common';
import { ProvablyFairService } from '../provably-fair.service';
import { Game } from '../entities/game.entity';

@Injectable()
export class SlotGameService {
  private readonly symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣'];
  private readonly symbolWeights = [25, 20, 20, 15, 10, 7, 3]; // Percentage weights

  constructor(private provablyFairService: ProvablyFairService) {}

  async spin(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    betAmount: number,
    game: Game,
  ): Promise<{ outcome: any; payout: number }> {
    // Generate 3 reels with 3 symbols each
    const reels: string[][] = [];
    let currentNonce = nonce;

    for (let reel = 0; reel < 3; reel++) {
      const symbols: string[] = [];
      for (let position = 0; position < 3; position++) {
        const symbol = this.getWeightedSymbol(
          serverSeed,
          clientSeed,
          currentNonce++,
        );
        symbols.push(symbol);
      }
      reels.push(symbols);
    }

    // Check for wins
    const { isWin, multiplier, winType } = this.checkWin(reels);
    const payout = isWin ? betAmount * multiplier : 0;

    return {
      outcome: {
        reels,
        isWin,
        winType,
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

  private checkWin(
    reels: string[][],
  ): { isWin: boolean; multiplier: number; winType: string } {
    // Check middle row (payline)
    const payline = [reels[0][1], reels[1][1], reels[2][1]];

    // Three of a kind
    if (payline[0] === payline[1] && payline[1] === payline[2]) {
      const multiplier = this.getSymbolMultiplier(payline[0]);
      return {
        isWin: true,
        multiplier,
        winType: `Three ${payline[0]}`,
      };
    }

    // Two of a kind (smaller win)
    if (payline[0] === payline[1] || payline[1] === payline[2]) {
      return {
        isWin: true,
        multiplier: 0.5,
        winType: 'Two matching',
      };
    }

    return { isWin: false, multiplier: 0, winType: 'No win' };
  }

  private getSymbolMultiplier(symbol: string): number {
    const multipliers = {
      '🍒': 2,
      '🍋': 3,
      '🍊': 4,
      '🍇': 5,
      '💎': 10,
      '⭐': 20,
      '7️⃣': 50,
    };
    return multipliers[symbol] || 1;
  }
}
