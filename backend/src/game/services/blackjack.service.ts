import { Injectable } from '@nestjs/common';
import { ProvablyFairService } from '../provably-fair.service';

interface Card {
  suit: string;
  rank: string;
  value: number;
}

@Injectable()
export class BlackjackService {
  private readonly suits = ['♠', '♥', '♦', '♣'];
  private readonly ranks = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];

  constructor(private provablyFairService: ProvablyFairService) {}

  async play(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    betAmount: number,
  ): Promise<{ outcome: any; payout: number }> {
    // Create and shuffle deck
    const deck = this.createDeck();
    const shuffledDeck = this.provablyFairService.shuffleArray(
      deck,
      serverSeed,
      clientSeed,
      nonce,
    );

    // Deal initial cards
    const playerHand: Card[] = [shuffledDeck[0], shuffledDeck[2]];
    const dealerHand: Card[] = [shuffledDeck[1], shuffledDeck[3]];

    let nextCardIndex = 4;

    // Simple auto-play logic (player hits until 17 or bust)
    let playerTotal = this.calculateHandValue(playerHand);
    while (playerTotal < 17) {
      playerHand.push(shuffledDeck[nextCardIndex++]);
      playerTotal = this.calculateHandValue(playerHand);
    }

    // Dealer plays (must hit on 16 or less, stand on 17+)
    let dealerTotal = this.calculateHandValue(dealerHand);
    while (dealerTotal < 17) {
      dealerHand.push(shuffledDeck[nextCardIndex++]);
      dealerTotal = this.calculateHandValue(dealerHand);
    }

    // Determine winner and payout
    let payout = 0;
    let result = '';

    if (playerTotal > 21) {
      result = 'Player busts - Dealer wins';
      payout = 0;
    } else if (dealerTotal > 21) {
      result = 'Dealer busts - Player wins!';
      payout = betAmount * 2;
    } else if (playerTotal > dealerTotal) {
      result = 'Player wins!';
      payout = betAmount * 2;
    } else if (dealerTotal > playerTotal) {
      result = 'Dealer wins';
      payout = 0;
    } else {
      result = 'Push (tie)';
      payout = betAmount; // Return bet
    }

    // Check for blackjack (pays 3:2)
    if (
      playerHand.length === 2 &&
      playerTotal === 21 &&
      dealerTotal !== 21
    ) {
      result = 'Blackjack!';
      payout = betAmount * 2.5;
    }

    return {
      outcome: {
        playerHand,
        dealerHand,
        playerTotal,
        dealerTotal,
        result,
      },
      payout,
    };
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of this.suits) {
      for (const rank of this.ranks) {
        deck.push({
          suit,
          rank,
          value: this.getCardValue(rank),
        });
      }
    }
    return deck;
  }

  private getCardValue(rank: string): number {
    if (rank === 'A') return 11; // Will be adjusted for aces
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
  }

  private calculateHandValue(hand: Card[]): number {
    let total = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter((card) => card.rank === 'A').length;

    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }
}
