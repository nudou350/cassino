import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Game, GameResult, GameSession } from '../../../core/models/game.model';

interface Card {
  suit: string;
  value: string;
  numericValue: number;
}

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './blackjack.component.html',
  styleUrl: './blackjack.component.css'
})
export class BlackjackComponent implements OnInit {
  game = signal<Game | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Game state
  betAmount = signal<number>(1);
  isDemoMode = signal<boolean>(false);
  gameInProgress = signal<boolean>(false);
  dealerTurn = signal<boolean>(false);

  // Cards
  playerHand = signal<Card[]>([]);
  dealerHand = signal<Card[]>([]);
  playerScore = signal<number>(0);
  dealerScore = signal<number>(0);

  // Result
  lastResult = signal<GameResult | null>(null);
  showResult = signal<boolean>(false);
  resultMessage = signal<string>('');

  // History
  gameHistory = signal<GameSession[]>([]);
  showHistory = signal<boolean>(false);

  // Balance
  balance = this.walletService.balance;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    const gameId = this.route.snapshot.paramMap.get('id');
    if (gameId) {
      this.loadGame(gameId);
      this.loadGameHistory(gameId);
    } else {
      this.error.set('Invalid game ID');
      this.loading.set(false);
    }

    this.walletService.getBalance().subscribe();
  }

  loadGame(id: string): void {
    this.loading.set(true);
    this.gameService.getGameById(id).subscribe({
      next: (game) => {
        this.game.set(game);
        this.betAmount.set(game.minBet);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to load game');
        this.loading.set(false);
      }
    });
  }

  loadGameHistory(gameId: string): void {
    this.gameService.getGameHistoryById(gameId, 1, 10).subscribe({
      next: (response) => {
        this.gameHistory.set(response.sessions);
      },
      error: (error) => {
        console.error('Failed to load game history:', error);
      }
    });
  }

  startGame(): void {
    const currentGame = this.game();
    if (!currentGame) return;

    // Validate bet
    if (this.betAmount() < currentGame.minBet || this.betAmount() > currentGame.maxBet) {
      alert(`Bet must be between $${currentGame.minBet} and $${currentGame.maxBet}`);
      return;
    }

    if (!this.isDemoMode() && this.betAmount() > this.balance()) {
      alert('Insufficient balance!');
      return;
    }

    this.gameInProgress.set(true);
    this.showResult.set(false);
    this.dealerTurn.set(false);

    // Call API to start game
    this.gameService.playGame({
      gameId: currentGame.id,
      betAmount: this.betAmount(),
      isDemo: this.isDemoMode(),
      gameData: { action: 'deal' }
    }).subscribe({
      next: (result) => {
        this.handleDealResult(result);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to start game');
        this.gameInProgress.set(false);
      }
    });
  }

  hit(): void {
    const currentGame = this.game();
    if (!currentGame) return;

    this.gameService.playGame({
      gameId: currentGame.id,
      betAmount: this.betAmount(),
      isDemo: this.isDemoMode(),
      gameData: { action: 'hit' }
    }).subscribe({
      next: (result) => {
        this.handleHitResult(result);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to hit');
      }
    });
  }

  stand(): void {
    const currentGame = this.game();
    if (!currentGame) return;

    this.dealerTurn.set(true);

    this.gameService.playGame({
      gameId: currentGame.id,
      betAmount: this.betAmount(),
      isDemo: this.isDemoMode(),
      gameData: { action: 'stand' }
    }).subscribe({
      next: (result) => {
        this.handleFinalResult(result);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to stand');
      }
    });
  }

  private handleDealResult(result: GameResult): void {
    if (result.outcome) {
      this.playerHand.set(result.outcome.playerHand || []);
      this.dealerHand.set(result.outcome.dealerHand || []);
      this.playerScore.set(result.outcome.playerScore || 0);
      this.dealerScore.set(result.outcome.dealerVisibleScore || 0);

      // Check for immediate blackjack
      if (result.outcome.result) {
        this.handleFinalResult(result);
      }
    }
  }

  private handleHitResult(result: GameResult): void {
    if (result.outcome) {
      this.playerHand.set(result.outcome.playerHand || []);
      this.playerScore.set(result.outcome.playerScore || 0);

      // Check if player busted or got 21
      if (result.outcome.result) {
        this.handleFinalResult(result);
      }
    }
  }

  private handleFinalResult(result: GameResult): void {
    this.lastResult.set(result);

    if (result.outcome) {
      this.playerHand.set(result.outcome.playerHand || []);
      this.dealerHand.set(result.outcome.dealerHand || []);
      this.playerScore.set(result.outcome.playerScore || 0);
      this.dealerScore.set(result.outcome.dealerScore || 0);
      this.resultMessage.set(result.outcome.result || '');
    }

    // Update balance
    if (!this.isDemoMode()) {
      this.walletService.updateBalance(result.newBalance);
    }

    this.gameInProgress.set(false);
    this.showResult.set(true);

    // Reload history
    const currentGame = this.game();
    if (currentGame) {
      this.loadGameHistory(currentGame.id);
    }
  }

  getCardDisplay(card: Card): string {
    const suitSymbols: { [key: string]: string } = {
      'hearts': '♥️',
      'diamonds': '♦️',
      'clubs': '♣️',
      'spades': '♠️'
    };
    return `${card.value}${suitSymbols[card.suit] || ''}`;
  }

  getCardColor(card: Card): string {
    return (card.suit === 'hearts' || card.suit === 'diamonds') ? 'text-red-500' : 'text-casino-light';
  }

  newRound(): void {
    this.playerHand.set([]);
    this.dealerHand.set([]);
    this.playerScore.set(0);
    this.dealerScore.set(0);
    this.showResult.set(false);
    this.resultMessage.set('');
    this.gameInProgress.set(false);
    this.dealerTurn.set(false);
  }

  increaseBet(): void {
    const game = this.game();
    if (!game) return;
    const newBet = this.betAmount() + 1;
    if (newBet <= game.maxBet) {
      this.betAmount.set(newBet);
    }
  }

  decreaseBet(): void {
    const game = this.game();
    if (!game) return;
    const newBet = this.betAmount() - 1;
    if (newBet >= game.minBet) {
      this.betAmount.set(newBet);
    }
  }

  setMaxBet(): void {
    const game = this.game();
    if (game) {
      this.betAmount.set(game.maxBet);
    }
  }

  toggleDemoMode(): void {
    this.isDemoMode.set(!this.isDemoMode());
  }

  toggleHistory(): void {
    this.showHistory.set(!this.showHistory());
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }
}
