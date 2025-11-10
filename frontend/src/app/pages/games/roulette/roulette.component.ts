import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Game, GameResult, GameSession } from '../../../core/models/game.model';

interface Bet {
  type: 'straight' | 'red' | 'black' | 'even' | 'odd' | 'high' | 'low';
  value: number | string;
  amount: number;
}

@Component({
  selector: 'app-roulette',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roulette.component.html',
  styleUrl: './roulette.component.css'
})
export class RouletteComponent implements OnInit {
  game = signal<Game | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Game state
  betAmount = signal<number>(1);
  isDemoMode = signal<boolean>(false);
  isSpinning = signal<boolean>(false);

  // Bets
  placedBets = signal<Bet[]>([]);
  totalBet = signal<number>(0);

  // Result
  winningNumber = signal<number | null>(null);
  lastResult = signal<GameResult | null>(null);
  showResult = signal<boolean>(false);

  // History
  gameHistory = signal<GameSession[]>([]);
  showHistory = signal<boolean>(false);

  // Balance
  balance = this.walletService.balance;

  // Roulette numbers and colors
  redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  // Generate number grid (0-36)
  numbers = Array.from({ length: 37 }, (_, i) => i);

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

  placeBet(type: Bet['type'], value: number | string): void {
    const currentGame = this.game();
    if (!currentGame || this.isSpinning()) return;

    // Check if bet amount is valid
    if (this.betAmount() < currentGame.minBet || this.betAmount() > currentGame.maxBet) {
      alert(`Bet must be between $${currentGame.minBet} and $${currentGame.maxBet}`);
      return;
    }

    // Check if total bet would exceed balance
    const newTotal = this.totalBet() + this.betAmount();
    if (!this.isDemoMode() && newTotal > this.balance()) {
      alert('Insufficient balance!');
      return;
    }

    // Add bet
    const bets = [...this.placedBets()];
    bets.push({ type, value, amount: this.betAmount() });
    this.placedBets.set(bets);
    this.totalBet.set(newTotal);
  }

  removeBet(index: number): void {
    const bets = [...this.placedBets()];
    const removedBet = bets.splice(index, 1)[0];
    this.placedBets.set(bets);
    this.totalBet.set(this.totalBet() - removedBet.amount);
  }

  clearBets(): void {
    this.placedBets.set([]);
    this.totalBet.set(0);
  }

  async spin(): Promise<void> {
    const currentGame = this.game();
    if (!currentGame || this.placedBets().length === 0) {
      alert('Please place at least one bet!');
      return;
    }

    this.isSpinning.set(true);
    this.showResult.set(false);

    // Animate spinning
    await this.animateSpin();

    // Call API
    this.gameService.playGame({
      gameId: currentGame.id,
      betAmount: this.totalBet(),
      isDemo: this.isDemoMode(),
      gameData: { bets: this.placedBets() }
    }).subscribe({
      next: (result) => {
        this.handleSpinResult(result);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to spin');
        this.isSpinning.set(false);
      }
    });
  }

  private async animateSpin(): Promise<void> {
    const duration = 3000;
    const interval = 100;
    const iterations = duration / interval;

    for (let i = 0; i < iterations; i++) {
      this.winningNumber.set(Math.floor(Math.random() * 37));
      await this.delay(interval);
    }
  }

  private handleSpinResult(result: GameResult): void {
    this.lastResult.set(result);

    if (result.outcome && result.outcome.winningNumber !== undefined) {
      this.winningNumber.set(result.outcome.winningNumber);
    }

    // Update balance
    if (!this.isDemoMode()) {
      this.walletService.updateBalance(result.newBalance);
    }

    this.isSpinning.set(false);
    this.showResult.set(true);

    // Reload history
    const currentGame = this.game();
    if (currentGame) {
      this.loadGameHistory(currentGame.id);
    }

    // Clear bets after showing result
    setTimeout(() => {
      this.clearBets();
      this.showResult.set(false);
    }, 5000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getNumberColor(num: number): string {
    if (num === 0) return 'bg-green-600';
    if (this.redNumbers.includes(num)) return 'bg-red-600';
    return 'bg-gray-900';
  }

  increaseBetAmount(): void {
    const game = this.game();
    if (!game) return;
    const newBet = this.betAmount() + 1;
    if (newBet <= game.maxBet) {
      this.betAmount.set(newBet);
    }
  }

  decreaseBetAmount(): void {
    const game = this.game();
    if (!game) return;
    const newBet = this.betAmount() - 1;
    if (newBet >= game.minBet) {
      this.betAmount.set(newBet);
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
