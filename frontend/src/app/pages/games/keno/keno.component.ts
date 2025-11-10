import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { WalletService } from '../../../core/services/wallet.service';
import { Game, GameResult, GameSession } from '../../../core/models/game.model';

@Component({
  selector: 'app-keno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './keno.component.html',
  styleUrl: './keno.component.css'
})
export class KenoComponent implements OnInit {
  game = signal<Game | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Game state
  betAmount = signal<number>(1);
  isPlaying = signal<boolean>(false);
  isDemoMode = signal<boolean>(false);
  selectedNumbers = signal<number[]>([]);
  drawnNumbers = signal<number[]>([]);
  matches = signal<number[]>([]);
  isDrawing = signal<boolean>(false);

  // Result state
  lastResult = signal<GameResult | null>(null);
  showResult = signal<boolean>(false);

  // History
  gameHistory = signal<GameSession[]>([]);
  showHistory = signal<boolean>(false);

  // Balance from wallet service
  balance = this.walletService.balance;

  // Computed
  canPlay = computed(() => {
    return this.selectedNumbers().length >= 1 &&
           this.selectedNumbers().length <= 10 &&
           !this.isPlaying() &&
           !this.isDrawing();
  });

  // All numbers for the grid (1-80)
  allNumbers = Array.from({ length: 80 }, (_, i) => i + 1);

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

  toggleNumber(num: number): void {
    if (this.isPlaying() || this.isDrawing()) return;

    const selected = [...this.selectedNumbers()];
    const index = selected.indexOf(num);

    if (index > -1) {
      // Remove number
      selected.splice(index, 1);
    } else {
      // Add number (max 10)
      if (selected.length < 10) {
        selected.push(num);
      } else {
        alert('You can select a maximum of 10 numbers');
        return;
      }
    }

    this.selectedNumbers.set(selected.sort((a, b) => a - b));
  }

  isNumberSelected(num: number): boolean {
    return this.selectedNumbers().includes(num);
  }

  isNumberDrawn(num: number): boolean {
    return this.drawnNumbers().includes(num);
  }

  isNumberMatch(num: number): boolean {
    return this.matches().includes(num);
  }

  quickPick(count: number): void {
    if (this.isPlaying() || this.isDrawing()) return;

    const numbers: number[] = [];
    const available = [...this.allNumbers];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * available.length);
      numbers.push(available[index]);
      available.splice(index, 1);
    }

    this.selectedNumbers.set(numbers.sort((a, b) => a - b));
  }

  clearSelection(): void {
    if (this.isPlaying() || this.isDrawing()) return;
    this.selectedNumbers.set([]);
  }

  async play(): Promise<void> {
    const currentGame = this.game();
    if (!currentGame || !this.canPlay()) return;

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
    this.drawnNumbers.set([]);
    this.matches.set([]);

    // Call API to play game
    this.gameService.playGame({
      gameId: currentGame.id,
      betAmount: this.betAmount(),
      isDemo: this.isDemoMode(),
      gameData: { selectedNumbers: this.selectedNumbers() }
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

    // Animate drawing numbers
    if (result.outcome && result.outcome.drawnNumbers) {
      await this.animateDrawing(result.outcome.drawnNumbers, result.outcome.matches);
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

  private async animateDrawing(drawn: number[], finalMatches: number[]): Promise<void> {
    this.isDrawing.set(true);
    const currentDrawn: number[] = [];

    for (const num of drawn) {
      await this.delay(100);
      currentDrawn.push(num);
      this.drawnNumbers.set([...currentDrawn]);

      // Update matches as we go
      const currentMatches = currentDrawn.filter(n => this.selectedNumbers().includes(n));
      this.matches.set(currentMatches);
    }

    this.isDrawing.set(false);
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

  newGame(): void {
    this.drawnNumbers.set([]);
    this.matches.set([]);
    this.showResult.set(false);
    this.lastResult.set(null);
  }
}
