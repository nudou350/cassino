import { Injectable } from '@nestjs/common';
import { ProvablyFairService } from '../provably-fair.service';

@Injectable()
export class RouletteService {
  private readonly redNumbers = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];
  private readonly blackNumbers = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];

  constructor(private provablyFairService: ProvablyFairService) {}

  async spin(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    betAmount: number,
    bet: {
      type?: string;
      number?: number;
      color?: string;
      range?: string;
    },
  ): Promise<{ outcome: any; payout: number }> {
    // Generate winning number (0-36 for European roulette)
    const winningNumber = this.provablyFairService.generateNumber(
      serverSeed,
      clientSeed,
      nonce,
      0,
      36,
    );

    const color = this.getNumberColor(winningNumber);
    const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
    const isLow = winningNumber >= 1 && winningNumber <= 18;

    let payout = 0;
    let result = '';

    // Check bet type and calculate payout
    if (bet.number !== undefined && bet.number === winningNumber) {
      // Straight up bet (35:1)
      payout = betAmount * 36;
      result = `Number ${winningNumber} wins!`;
    } else if (bet.color && bet.color === color) {
      // Color bet (1:1)
      payout = betAmount * 2;
      result = `${color} wins!`;
    } else if (bet.type === 'even' && isEven) {
      payout = betAmount * 2;
      result = 'Even wins!';
    } else if (bet.type === 'odd' && !isEven && winningNumber !== 0) {
      payout = betAmount * 2;
      result = 'Odd wins!';
    } else if (bet.range === 'low' && isLow) {
      payout = betAmount * 2;
      result = 'Low (1-18) wins!';
    } else if (bet.range === 'high' && !isLow && winningNumber !== 0) {
      payout = betAmount * 2;
      result = 'High (19-36) wins!';
    } else {
      result = 'No win';
    }

    return {
      outcome: {
        winningNumber,
        color,
        isEven: winningNumber !== 0 ? isEven : null,
        result,
      },
      payout,
    };
  }

  private getNumberColor(number: number): string {
    if (number === 0) return 'green';
    if (this.redNumbers.includes(number)) return 'red';
    if (this.blackNumbers.includes(number)) return 'black';
    return 'unknown';
  }
}
