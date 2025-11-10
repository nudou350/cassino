import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div class="max-w-2xl mx-auto">
        <button
          (click)="goBack()"
          class="text-white mb-6 flex items-center hover:text-gray-300 transition-colors">
          ← Back to Wallet
        </button>

        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20">
          <h1 class="text-3xl font-bold text-white mb-6">Deposit Funds</h1>

          <form [formGroup]="depositForm" (ngSubmit)="onSubmit()">
            <!-- Amount -->
            <div class="mb-6">
              <label class="block text-gray-200 mb-2 font-semibold">Amount</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">\$</span>
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  class="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
              </div>
              @if (depositForm.get('amount')?.touched && depositForm.get('amount')?.errors) {
                <p class="text-red-400 text-sm mt-1">
                  @if (depositForm.get('amount')?.errors?.['required']) {
                    Amount is required
                  }
                  @if (depositForm.get('amount')?.errors?.['min']) {
                    Minimum deposit is \$10
                  }
                  @if (depositForm.get('amount')?.errors?.['max']) {
                    Maximum deposit is \$10,000
                  }
                </p>
              }
            </div>

            <!-- Quick Amount Buttons -->
            <div class="grid grid-cols-4 gap-2 mb-6">
              @for (amount of quickAmounts; track amount) {
                <button
                  type="button"
                  (click)="setAmount(amount)"
                  class="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold transition-colors">
                  \${{ amount }}
                </button>
              }
            </div>

            <!-- Payment Method -->
            <div class="mb-6">
              <label class="block text-gray-200 mb-2 font-semibold">Payment Method</label>
              <select
                formControlName="paymentMethod"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-blue-500">
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                <p class="text-red-400">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <div class="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                <p class="text-green-400">{{ successMessage() }}</p>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="depositForm.invalid || processing()"
              class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors">
              @if (processing()) {
                Processing...
              } @else {
                Deposit Now
              }
            </button>
          </form>

          <!-- Info -->
          <div class="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p class="text-blue-300 text-sm">
              <strong>Note:</strong> Deposits are usually processed instantly. Cryptocurrency deposits may take up to 30 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DepositComponent {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletService);
  private router = inject(Router);

  quickAmounts = [25, 50, 100, 500];
  processing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  depositForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(10), Validators.max(10000)]],
    paymentMethod: ['credit_card', Validators.required]
  });

  setAmount(amount: number) {
    this.depositForm.patchValue({ amount });
  }

  onSubmit() {
    if (this.depositForm.valid) {
      this.processing.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { amount, paymentMethod } = this.depositForm.value;

      this.walletService.deposit(amount!, paymentMethod!).subscribe({
        next: () => {
          this.processing.set(false);
          this.successMessage.set('Deposit successful!');
          setTimeout(() => {
            this.router.navigate(['/wallet']);
          }, 2000);
        },
        error: (error) => {
          this.processing.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to process deposit');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/wallet']);
  }
}
