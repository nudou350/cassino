import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-responsible-gaming',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div class="max-w-4xl mx-auto">
        <button
          (click)="goBack()"
          class="text-white mb-6 flex items-center hover:text-gray-300 transition-colors">
          ← Back to Dashboard
        </button>

        <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">Responsible Gaming</h1>
        <p class="text-gray-300 mb-8">Set limits to help you manage your gaming experience and play responsibly.</p>

        <!-- Important Notice -->
        <div class="bg-yellow-500/20 backdrop-blur-md rounded-xl p-6 mb-6 border border-yellow-500/50">
          <h3 class="text-lg font-bold text-yellow-300 mb-2">Play Responsibly</h3>
          <p class="text-yellow-200 text-sm">
            Gaming should be entertaining. If you feel you're losing control, please consider setting limits or self-excluding.
            For help, visit <a href="#" class="underline">Gambling Addiction Resources</a>.
          </p>
        </div>

        <!-- Deposit Limits -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 mb-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-6">Deposit Limits</h2>

          <form [formGroup]="limitsForm" (ngSubmit)="updateLimits()">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <!-- Daily Limit -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Daily Limit</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">\$</span>
                  <input
                    type="number"
                    formControlName="dailyLimit"
                    placeholder="0.00"
                    class="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
                </div>
                @if (currentLimits().dailyLimit) {
                  <p class="text-sm text-gray-400 mt-1">Current: \${{ currentLimits().dailyLimit }}</p>
                }
              </div>

              <!-- Weekly Limit -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Weekly Limit</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">\$</span>
                  <input
                    type="number"
                    formControlName="weeklyLimit"
                    placeholder="0.00"
                    class="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
                </div>
                @if (currentLimits().weeklyLimit) {
                  <p class="text-sm text-gray-400 mt-1">Current: \${{ currentLimits().weeklyLimit }}</p>
                }
              </div>

              <!-- Monthly Limit -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Monthly Limit</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">\$</span>
                  <input
                    type="number"
                    formControlName="monthlyLimit"
                    placeholder="0.00"
                    class="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
                </div>
                @if (currentLimits().monthlyLimit) {
                  <p class="text-sm text-gray-400 mt-1">Current: \${{ currentLimits().monthlyLimit }}</p>
                }
              </div>
            </div>

            @if (limitsMessage()) {
              <div class="mb-4 p-4 rounded-lg border" [ngClass]="{'bg-green-500/20 border-green-500': limitsMessage()!.type === 'success', 'bg-red-500/20 border-red-500': limitsMessage()!.type === 'error'}">
                <p [ngClass]="{'text-green-400': limitsMessage()!.type === 'success', 'text-red-400': limitsMessage()!.type === 'error'}">
                  {{ limitsMessage()!.text }}
                </p>
              </div>
            }

            <button
              type="submit"
              [disabled]="limitsForm.invalid || limitsProcessing()"
              class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors">
              @if (limitsProcessing()) {
                Saving...
              } @else {
                Update Limits
              }
            </button>
          </form>
        </div>

        <!-- Session Controls -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 mb-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-6">Session Controls</h2>

          <div class="space-y-4">
            <!-- Reality Check -->
            <div class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/20">
              <div class="mb-4 md:mb-0">
                <h3 class="text-white font-semibold mb-1">Reality Check</h3>
                <p class="text-sm text-gray-400">Get reminded of your play time every</p>
              </div>
              <select class="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                <option value="0">Disabled</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <!-- Session Timeout -->
            <div class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/20">
              <div class="mb-4 md:mb-0">
                <h3 class="text-white font-semibold mb-1">Session Timeout</h3>
                <p class="text-sm text-gray-400">Automatically log out after</p>
              </div>
              <select class="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                <option value="0">Never</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Self-Exclusion -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-4">Self-Exclusion</h2>
          <p class="text-gray-300 mb-6">
            If you need a break from gaming, you can temporarily or permanently exclude yourself from the platform.
          </p>

          <form [formGroup]="exclusionForm" (ngSubmit)="requestSelfExclusion()">
            <div class="mb-6">
              <label class="block text-gray-200 mb-2 font-semibold">Exclusion Period</label>
              <select
                formControlName="period"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:border-blue-500">
                <option value="">Select period</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>

            <div class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p class="text-red-300 text-sm">
                <strong>Warning:</strong> During the exclusion period, you will not be able to access your account or place any bets.
                This action cannot be reversed once confirmed.
              </p>
            </div>

            @if (exclusionMessage()) {
              <div class="mb-4 p-4 rounded-lg border" [ngClass]="{'bg-green-500/20 border-green-500': exclusionMessage()!.type === 'success', 'bg-red-500/20 border-red-500': exclusionMessage()!.type === 'error'}">
                <p [ngClass]="{'text-green-400': exclusionMessage()!.type === 'success', 'text-red-400': exclusionMessage()!.type === 'error'}">
                  {{ exclusionMessage()!.text }}
                </p>
              </div>
            }

            <button
              type="submit"
              [disabled]="exclusionForm.invalid || exclusionProcessing()"
              class="w-full md:w-auto bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors">
              @if (exclusionProcessing()) {
                Processing...
              } @else {
                Request Self-Exclusion
              }
            </button>
          </form>
        </div>

        <!-- Help Resources -->
        <div class="bg-blue-500/20 backdrop-blur-md rounded-xl p-6 mt-6 border border-blue-500/50">
          <h3 class="text-lg font-bold text-blue-300 mb-3">Need Help?</h3>
          <div class="space-y-2 text-blue-200 text-sm">
            <p>If you or someone you know has a gambling problem, help is available:</p>
            <ul class="list-disc list-inside space-y-1 ml-2">
              <li>National Council on Problem Gambling: 1-800-522-4700</li>
              <li>Gamblers Anonymous: <a href="#" class="underline">www.gamblersanonymous.org</a></li>
              <li>SAMHSA National Helpline: 1-800-662-4357</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ResponsibleGamingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentLimits = signal<any>({ dailyLimit: null, weeklyLimit: null, monthlyLimit: null });
  limitsProcessing = signal<boolean>(false);
  exclusionProcessing = signal<boolean>(false);
  limitsMessage = signal<{type: string, text: string} | null>(null);
  exclusionMessage = signal<{type: string, text: string} | null>(null);

  limitsForm = this.fb.group({
    dailyLimit: [null, [Validators.min(0)]],
    weeklyLimit: [null, [Validators.min(0)]],
    monthlyLimit: [null, [Validators.min(0)]]
  });

  exclusionForm = this.fb.group({
    period: ['', Validators.required]
  });

  ngOnInit() {
    this.loadCurrentLimits();
  }

  loadCurrentLimits() {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        if (user.responsibleGamingLimits) {
          this.currentLimits.set(user.responsibleGamingLimits);
        }
      },
      error: (error) => console.error('Failed to load limits:', error)
    });
  }

  updateLimits() {
    if (this.limitsForm.valid) {
      this.limitsProcessing.set(true);
      this.limitsMessage.set(null);

      this.authService.updateResponsibleGamingLimits(this.limitsForm.value).subscribe({
        next: () => {
          this.limitsProcessing.set(false);
          this.limitsMessage.set({ type: 'success', text: 'Limits updated successfully!' });
          this.loadCurrentLimits();
          this.limitsForm.reset();
        },
        error: (error: any) => {
          this.limitsProcessing.set(false);
          this.limitsMessage.set({ type: 'error', text: error.error?.message || 'Failed to update limits' });
        }
      });
    }
  }

  requestSelfExclusion() {
    if (this.exclusionForm.valid) {
      this.exclusionProcessing.set(true);
      this.exclusionMessage.set(null);

      const { period } = this.exclusionForm.value;

      this.authService.requestSelfExclusion(period!).subscribe({
        next: () => {
          this.exclusionProcessing.set(false);
          this.exclusionMessage.set({ type: 'success', text: 'Self-exclusion request submitted successfully.' });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error: any) => {
          this.exclusionProcessing.set(false);
          this.exclusionMessage.set({ type: 'error', text: error.error?.message || 'Failed to process request' });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
