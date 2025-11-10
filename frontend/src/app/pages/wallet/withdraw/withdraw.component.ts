import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletService } from '../../../core/services/wallet.service';

@Component({
  selector: 'app-withdraw',
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
          <h1 class="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
          <p class="text-gray-300 mb-6">Available Balance: \${{ availableBalance().toFixed(2) }}</p>

          <form [formGroup]="withdrawForm" (ngSubmit)="onSubmit()">
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
              @if (withdrawForm.get('amount')?.touched && withdrawForm.get('amount')?.errors) {
                <p class="text-red-400 text-sm mt-1">
                  @if (withdrawForm.get('amount')?.errors?.['required']) {
                    Amount is required
                  }
                  @if (withdrawForm.get('amount')?.errors?.['min']) {
                    Minimum withdrawal is \$20
                  }
                  @if (withdrawForm.get('amount')?.errors?.['max']) {
                    Insufficient balance
                  }
                </p>
              }
            </div>

            <!-- Quick Amount Buttons -->
            <div class="mb-6">
              <button
                type="button"
                (click)="withdrawAll()"
                class="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold transition-colors">
                Withdraw All
              </button>
            </div>

            <!-- Withdrawal Method -->
            <div class="mb-6">
              <label class="block text-gray-200 mb-2 font-semibold">Withdrawal Method</label>
              <select
                formControlName="withdrawalMethod"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-blue-500">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>

            <!-- Account Details -->
            <div class="mb-6">
              <label class="block text-gray-200 mb-2 font-semibold">Account Details</label>
              <input
                type="text"
                formControlName="accountDetails"
                placeholder="Enter your account information"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
              @if (withdrawForm.get('accountDetails')?.touched && withdrawForm.get('accountDetails')?.errors?.['required']) {
                <p class="text-red-400 text-sm mt-1">Account details are required</p>
              }
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
              [disabled]="withdrawForm.invalid || processing()"
              class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors">
              @if (processing()) {
                Processing...
              } @else {
                Request Withdrawal
              }
            </button>
          </form>

          <!-- Info -->
          <div class="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p class="text-yellow-300 text-sm">
              <strong>Note:</strong> Withdrawals are processed within 1-3 business days. Additional verification may be required for large amounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WithdrawComponent implements OnInit {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletService);
  private router = inject(Router);

  availableBalance = signal<number>(0);
  processing = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  withdrawForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(20)]],
    withdrawalMethod: ['bank_transfer', Validators.required],
    accountDetails: ['', Validators.required]
  });

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance() {
    this.walletService.getBalance().subscribe({
      next: (data) => {
        this.availableBalance.set(data.balance);
        this.withdrawForm.get('amount')?.setValidators([
          Validators.required,
          Validators.min(20),
          Validators.max(data.balance)
        ]);
      },
      error: (error: any) => {
        console.error('Failed to load balance:', error);
      }
    });
  }

  withdrawAll() {
    this.withdrawForm.patchValue({ amount: this.availableBalance() });
  }

  onSubmit() {
    if (this.withdrawForm.valid) {
      this.processing.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { amount, withdrawalMethod, accountDetails } = this.withdrawForm.value;

      this.walletService.withdraw(amount!, withdrawalMethod!, accountDetails!).subscribe({
        next: () => {
          this.processing.set(false);
          this.successMessage.set('Withdrawal request submitted successfully!');
          setTimeout(() => {
            this.router.navigate(['/wallet']);
          }, 2000);
        },
        error: (error) => {
          this.processing.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to process withdrawal');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/wallet']);
  }
}
