import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Dashboard</h1>

        <!-- Welcome Card -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-2">Welcome back, {{ username() }}!</h2>
          <p class="text-gray-300">Manage your account, view your stats, and control your gaming experience.</p>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <!-- Balance Card -->
          <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
            <div class="text-sm text-gray-300 mb-2">Total Balance</div>
            <div class="text-3xl font-bold text-white mb-1">\${{ balance().toFixed(2) }}</div>
            <button
              routerLink="/wallet"
              class="text-green-400 hover:text-green-300 text-sm font-semibold">
              Manage Wallet →
            </button>
          </div>

          <!-- Games Played -->
          <div class="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
            <div class="text-sm text-gray-300 mb-2">Games Played</div>
            <div class="text-3xl font-bold text-white mb-1">{{ gamesPlayed() }}</div>
            <button
              routerLink="/games"
              class="text-blue-400 hover:text-blue-300 text-sm font-semibold">
              Play Now →
            </button>
          </div>

          <!-- VIP Level -->
          <div class="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <div class="text-sm text-gray-300 mb-2">VIP Level</div>
            <div class="text-3xl font-bold text-white mb-1">{{ vipLevel() }}</div>
            <div class="text-purple-400 text-sm font-semibold">{{ vipLevelName() }}</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Account Management -->
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 class="text-xl font-bold text-white mb-4">Account Management</h3>
            <div class="space-y-3">
              <button
                routerLink="/dashboard/profile"
                class="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-colors">
                Profile Settings
              </button>
              <button
                routerLink="/dashboard/responsible-gaming"
                class="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-colors">
                Responsible Gaming
              </button>
              <button
                routerLink="/wallet"
                class="w-full text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition-colors">
                Transaction History
              </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 class="text-xl font-bold text-white mb-4">Recent Activity</h3>
            @if (loading()) {
              <div class="text-center py-8 text-gray-300">Loading...</div>
            } @else if (recentGames().length === 0) {
              <div class="text-center py-8 text-gray-300">No recent games</div>
            } @else {
              <div class="space-y-3">
                @for (game of recentGames(); track game.id) {
                  <div class="px-4 py-3 rounded-lg bg-white/5 border border-white/20">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="text-white font-semibold">{{ game.name }}</div>
                        <div class="text-sm text-gray-400">{{ formatDate(game.playedAt) }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold"
                             [class.text-green-400]="game.result === 'win'"
                             [class.text-red-400]="game.result === 'loss'">
                          {{ game.result === 'win' ? '+' : '-' }}\${{ game.amount.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Account Security -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 class="text-xl font-bold text-white mb-4">Account Security</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/20">
              <div>
                <div class="text-white font-semibold">Two-Factor Authentication</div>
                <div class="text-sm text-gray-400">Add an extra layer of security</div>
              </div>
              <div class="text-yellow-400 text-sm">Not Enabled</div>
            </div>
            <div class="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/20">
              <div>
                <div class="text-white font-semibold">KYC Verification</div>
                <div class="text-sm text-gray-400">Verify your identity</div>
              </div>
              <div class="text-yellow-400 text-sm">{{ kycStatus() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private walletService = inject(WalletService);

  username = signal<string>('Player');
  balance = signal<number>(0);
  gamesPlayed = signal<number>(0);
  vipLevel = signal<number>(1);
  vipLevelName = signal<string>('Bronze');
  kycStatus = signal<string>('Pending');
  recentGames = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Load user profile
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.username.set(user.username || user.email);
        this.vipLevel.set(user.vipLevel || 1);
        this.vipLevelName.set(this.getVipLevelName(user.vipLevel || 1));
        this.kycStatus.set(user.kycStatus || 'Pending');
      },
      error: (error) => console.error('Failed to load profile:', error)
    });

    // Load wallet balance
    this.walletService.getBalance().subscribe({
      next: (data) => {
        this.balance.set(data.balance + (data.bonusBalance || 0));
      },
      error: (error) => console.error('Failed to load balance:', error)
    });

    // Mock recent games data (replace with actual API call)
    setTimeout(() => {
      this.recentGames.set([
        { id: 1, name: 'Mega Fortune Slots', playedAt: new Date().toISOString(), result: 'win', amount: 50.00 },
        { id: 2, name: 'Blackjack Classic', playedAt: new Date(Date.now() - 3600000).toISOString(), result: 'loss', amount: 25.00 },
        { id: 3, name: 'European Roulette', playedAt: new Date(Date.now() - 7200000).toISOString(), result: 'win', amount: 100.00 }
      ]);
      this.gamesPlayed.set(127);
      this.loading.set(false);
    }, 1000);
  }

  getVipLevelName(level: number): string {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    return levels[Math.min(level - 1, levels.length - 1)] || 'Bronze';
  }

  formatDate(date: string): string {
    const now = new Date();
    const gameDate = new Date(date);
    const diffMs = now.getTime() - gameDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
