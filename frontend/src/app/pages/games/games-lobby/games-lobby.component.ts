import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../../core/services/game.service';
import { Game } from '../../../core/models/game.model';

@Component({
  selector: 'app-games-lobby',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './games-lobby.component.html',
  styleUrl: './games-lobby.component.css'
})
export class GamesLobbyComponent implements OnInit {
  games = signal<Game[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  searchQuery = signal<string>('');
  selectedType = signal<string>('ALL');

  gameTypes = ['ALL', 'SLOT', 'BLACKJACK', 'ROULETTE', 'SCRATCH_CARD', 'KENO', 'BACCARAT', 'POKER', 'OTHER'];

  // Filtered games based on search and type
  filteredGames = computed(() => {
    let filtered = this.games();

    // Filter by type
    if (this.selectedType() !== 'ALL') {
      filtered = filtered.filter(game => game.type === this.selectedType());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.loading.set(true);
    this.error.set('');

    this.gameService.getAllGames().subscribe({
      next: (games) => {
        this.games.set(games);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to load games');
        this.loading.set(false);
        console.error('Error loading games:', error);
      }
    });
  }

  playGame(game: Game): void {
    // Navigate to the appropriate game component based on type
    const gameRoute = this.getGameRoute(game);
    this.router.navigate([gameRoute, game.id]);
  }

  private getGameRoute(game: Game): string {
    switch (game.type) {
      case 'SLOT':
        return '/games/slot';
      case 'BLACKJACK':
        return '/games/blackjack';
      case 'ROULETTE':
        return '/games/roulette';
      case 'SCRATCH_CARD':
        return '/games/scratch_card';
      case 'KENO':
        return '/games/keno';
      default:
        return '/games/slot'; // Default to slot
    }
  }

  setGameType(type: string): void {
    this.selectedType.set(type);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  getVolatilityColor(volatility: string): string {
    switch (volatility) {
      case 'LOW':
        return 'text-green-400';
      case 'MEDIUM':
        return 'text-yellow-400';
      case 'HIGH':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }
}
