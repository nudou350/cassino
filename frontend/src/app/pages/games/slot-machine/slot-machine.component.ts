import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Game, GameResult, GameSession } from '../../../core/models/game.model';

@Component({
  selector: 'app-slot-machine',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './slot-machine.component.html',
  styleUrl: './slot-machine.component.css'
})
export class SlotMachineComponent implements OnInit {
  game = signal<Game | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Game state
  betAmount = signal<number>(1);
  isSpinning = signal<boolean>(false);
  isDemoMode = signal<boolean>(false);
  reels = signal<string[][]>([
    ['🍒', '🍒', '🍒'],
    ['🍒', '🍒', '🍒'],
    ['🍒', '🍒', '🍒']
  ]);

  // Result state
  lastResult = signal<GameResult | null>(null);
  showResult = signal<boolean>(false);

  // History
  gameHistory = signal<GameSession[]>([]);
  showHistory = signal<boolean>(false);

  // Balance from wallet service
  balance = this.walletService.balance;

  // Available symbols for animation
  symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣', '💎'];

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

  async spin(): Promise<void> {
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

    this.isSpinning.set(true);
    this.showResult.set(false);

    // Animate spinning
    await this.animateReels();

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
        this.isSpinning.set(false);
        console.error('Game error:', error);
      }
    });
  }

  private async animateReels(): Promise<void> {
    const duration = 2000; // 2 seconds
    const interval = 100;
    const iterations = duration / interval;

    for (let i = 0; i < iterations; i++) {
      const newReels = [
        [this.getRandomSymbol(), this.getRandomSymbol(), this.getRandomSymbol()],
        [this.getRandomSymbol(), this.getRandomSymbol(), this.getRandomSymbol()],
        [this.getRandomSymbol(), this.getRandomSymbol(), this.getRandomSymbol()]
      ];
      this.reels.set(newReels);
      await this.delay(interval);
    }
  }

  private handleGameResult(result: GameResult): void {
    this.lastResult.set(result);

    // Update reels with result
    if (result.outcome && result.outcome.reels) {
      this.reels.set(result.outcome.reels.map((reel: string[]) => [...reel]));
    }

    // Update balance (in real mode)
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

    // Auto-hide result after 5 seconds
    setTimeout(() => {
      this.showResult.set(false);
    }, 5000);
  }

  private getRandomSymbol(): string {
    return this.symbols[Math.floor(Math.random() * this.symbols.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
