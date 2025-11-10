import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-wallet-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Wallet</h1>

        <!-- Balance Card -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div class="text-sm text-gray-300 mb-2">Available Balance</div>
          <div class="text-4xl font-bold text-white mb-4">\${{ balance().toFixed(2) }}</div>
          <div class="text-sm text-gray-300 mb-4">Bonus Balance: \${{ bonusBalance().toFixed(2) }}</div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              routerLink="/wallet/deposit"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Deposit
            </button>
            <button
              routerLink="/wallet/withdraw"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Withdraw
            </button>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-4">Recent Transactions</h2>

          @if (loading()) {
            <div class="text-center py-8 text-gray-300">Loading transactions...</div>
          } @else if (transactions().length === 0) {
            <div class="text-center py-8 text-gray-300">No transactions yet</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-white/20">
                    <th class="text-left py-3 px-2 text-gray-300 font-semibold">Date</th>
                    <th class="text-left py-3 px-2 text-gray-300 font-semibold">Type</th>
                    <th class="text-right py-3 px-2 text-gray-300 font-semibold">Amount</th>
                    <th class="text-right py-3 px-2 text-gray-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (transaction of transactions(); track transaction.id) {
                    <tr class="border-b border-white/10 hover:bg-white/5">
                      <td class="py-3 px-2 text-gray-200">{{ formatDate(transaction.createdAt) }}</td>
                      <td class="py-3 px-2 text-gray-200 capitalize">{{ transaction.type }}</td>
                      <td class="py-3 px-2 text-right font-semibold"
                          [class.text-green-400]="transaction.type === 'deposit' || transaction.type === 'win'"
                          [class.text-red-400]="transaction.type === 'withdrawal' || transaction.type === 'bet'">
                        {{ transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-' }}\${{ transaction.amount.toFixed(2) }}
                      </td>
                      <td class="py-3 px-2 text-right">
                        <span class="px-2 py-1 rounded-full text-xs"
                              [ngClass]="{
                                'bg-green-500/20 text-green-400': transaction.status === 'COMPLETED',
                                'bg-yellow-500/20 text-yellow-400': transaction.status === 'PENDING',
                                'bg-red-500/20 text-red-400': transaction.status === 'FAILED'
                              }">
                          {{ transaction.status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WalletDashboardComponent implements OnInit {
  private walletService = inject(WalletService);

  balance = signal<number>(0);
  bonusBalance = signal<number>(0);
  transactions = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadWalletData();
  }

  loadWalletData() {
    this.walletService.getBalance().subscribe({
      next: (data) => {
        this.balance.set(data.balance);
        this.bonusBalance.set(data.bonusBalance || 0);
      },
      error: (error) => {
        console.error('Failed to load balance:', error);
      }
    });

    this.walletService.getTransactions().subscribe({
      next: (data: any) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load transactions:', error);
        this.loading.set(false);
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
