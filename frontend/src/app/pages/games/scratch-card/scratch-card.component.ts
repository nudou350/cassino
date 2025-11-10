import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Game, GameResult, GameSession } from '../../../core/models/game.model';

@Component({
  selector: 'app-scratch-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scratch-card.component.html',
  styleUrl: './scratch-card.component.css'
})
export class ScratchCardComponent implements OnInit {
  game = signal<Game | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Game state
  betAmount = signal<number>(1);
  isPlaying = signal<boolean>(false);
  isDemoMode = signal<boolean>(false);
  squares = signal<string[]>(Array(9).fill('?'));
  scratchedSquares = signal<boolean[]>(Array(9).fill(false));
  isRevealing = signal<boolean>(false);

  // Result state
  lastResult = signal<GameResult | null>(null);
  showResult = signal<boolean>(false);

  // History
  gameHistory = signal<GameSession[]>([]);
  showHistory = signal<boolean>(false);

  // Balance from wallet service
  balance = this.walletService.balance;

  // Available symbols
  symbols = ['🍒', '🍋', '💎', '⭐', '🎁', '💰'];

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

    // Fetch current balance
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

  async play(): Promise<void> {
    const currentGame = this.game();
    if (!currentGame) return;

    // Validate bet amount
    if (this.betAmount() < currentGame.minBet) {
      alert(`Minimum bet is $${currentGame.minBet}`);
      return;
    }

    if (this.betAmount() > currentGame.maxBet) {
      alert(`Maximum bet is $${currentGame.maxBet}`);
      return;
    }

    // Check balance (only in real mode)
    if (!this.isDemoMode() && this.betAmount() > this.balance()) {
      alert('Insufficient balance!');
      return;
    }

    this.isPlaying.set(true);
    this.showResult.set(false);
    this.scratchedSquares.set(Array(9).fill(false));

    // Call API to play game
    this.gameService.playGame({
      gameId: currentGame.id,
      betAmount: this.betAmount(),
      isDemo: this.isDemoMode()
    }).subscribe({
      next: (result) => {
        this.handleGameResult(result);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to play game');
        this.isPlaying.set(false);
        console.error('Game error:', error);
      }
    });
  }

  private async handleGameResult(result: GameResult): Promise<void> {
    this.lastResult.set(result);

    // Update squares with result
    if (result.outcome && result.outcome.squares) {
      this.squares.set([...result.outcome.squares]);

      // Animate revealing squares
      await this.revealSquares();
    }

    // Update balance (in real mode)
    if (!this.isDemoMode()) {
      this.walletService.updateBalance(result.newBalance);
    }

    this.isPlaying.set(false);
    this.showResult.set(true);

    // Reload history
    const currentGame = this.game();
    if (currentGame) {
      this.loadGameHistory(currentGame.id);
    }
  }

  private async revealSquares(): Promise<void> {
    this.isRevealing.set(true);
    const scratched = [...this.scratchedSquares()];

    for (let i = 0; i < 9; i++) {
      await this.delay(200);
      scratched[i] = true;
      this.scratchedSquares.set([...scratched]);
    }

    this.isRevealing.set(false);
  }

  scratchSquare(index: number): void {
    if (!this.isRevealing() && this.lastResult()) {
      const scratched = [...this.scratchedSquares()];
      scratched[index] = true;
      this.scratchedSquares.set(scratched);
    }
  }

  revealAll(): void {
    if (this.lastResult()) {
      this.scratchedSquares.set(Array(9).fill(true));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  increaseBet(): void {
    const game = this.game();
    if (!game) return;

    const newBet = this.betAmount() + 0.5;
    if (newBet <= game.maxBet) {
      this.betAmount.set(newBet);
    }
  }

  decreaseBet(): void {
    const game = this.game();
    if (!game) return;

    const newBet = this.betAmount() - 0.5;
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

  newGame(): void {
    this.squares.set(Array(9).fill('?'));
    this.scratchedSquares.set(Array(9).fill(false));
    this.showResult.set(false);
    this.lastResult.set(null);
  }
}
