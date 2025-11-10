import { Injectable } from '@nestjs/common';
import { ProvablyFairService } from '../provably-fair.service';
import { Game } from '../entities/game.entity';

@Injectable()
export class KenoService {
  private readonly totalNumbers = 80;
  private readonly drawCount = 20;

  constructor(private provablyFairService: ProvablyFairService) {}

  async play(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    betAmount: number,
    game: Game,
    selectedNumbers: number[],
  ): Promise<{ outcome: any; payout: number }> {
    // Validate selected numbers
    if (!selectedNumbers || selectedNumbers.length < 1 || selectedNumbers.length > 10) {
      throw new Error('Must select between 1 and 10 numbers');
    }

    // Validate number range
    if (selectedNumbers.some((num) => num < 1 || num > this.totalNumbers)) {
      throw new Error(`Numbers must be between 1 and ${this.totalNumbers}`);
    }

    // Check for duplicates
    if (new Set(selectedNumbers).size !== selectedNumbers.length) {
      throw new Error('Cannot select duplicate numbers');
    }

    // Draw random numbers
    const drawnNumbers = this.drawNumbers(serverSeed, clientSeed, nonce);

    // Check matches
    const matches = selectedNumbers.filter((num) =>
      drawnNumbers.includes(num),
    );
    const matchCount = matches.length;

    // Calculate payout
    const multiplier = this.getPayoutMultiplier(
      selectedNumbers.length,
      matchCount,
    );
    const payout = betAmount * multiplier;

    return {
      outcome: {
        selectedNumbers,
        drawnNumbers,
        matches,
        matchCount,
        multiplier,
      },
      payout,
    };
  }

  private drawNumbers(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): number[] {
    const drawn: number[] = [];
    const available = Array.from(
      { length: this.totalNumbers },
      (_, i) => i + 1,
    );
    let currentNonce = nonce;

    // Draw 20 unique numbers
    for (let i = 0; i < this.drawCount; i++) {
      const index = this.provablyFairService.generateNumber(
        serverSeed,
        clientSeed,
        currentNonce++,
        0,
        available.length - 1,
      );

      drawn.push(available[index]);
      available.splice(index, 1); // Remove drawn number from pool
    }

    return drawn.sort((a, b) => a - b);
  }

  private getPayoutMultiplier(
    selectedCount: number,
    matchCount: number,
  ): number {
    // Keno payout table based on spots picked and matches
    const payoutTable: { [key: number]: { [key: number]: number } } = {
      1: { 1: 3.0 },
      2: { 1: 0, 2: 9.0 },
      3: { 1: 0, 2: 1.5, 3: 25.0 },
      4: { 1: 0, 2: 0.5, 3: 3.0, 4: 50.0 },
      5: { 2: 0, 3: 1.0, 4: 5.0, 5: 100.0 },
      6: { 2: 0, 3: 0.5, 4: 2.0, 5: 20.0, 6: 200.0 },
      7: { 3: 0.5, 4: 1.0, 5: 5.0, 6: 50.0, 7: 500.0 },
      8: { 3: 0, 4: 0.5, 5: 2.0, 6: 10.0, 7: 100.0, 8: 1000.0 },
      9: { 4: 0.5, 5: 1.0, 6: 5.0, 7: 25.0, 8: 250.0, 9: 2000.0 },
      10: { 4: 0, 5: 0.5, 6: 2.0, 7: 10.0, 8: 50.0, 9: 500.0, 10: 5000.0 },
    };

    const table = payoutTable[selectedCount];
    if (!table) return 0;

    return table[matchCount] || 0;
  }
}
