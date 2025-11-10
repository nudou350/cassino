import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-settings',
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

        <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Profile Settings</h1>

        <!-- Profile Information -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 mb-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-6">Personal Information</h2>

          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Username -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Username</label>
                <input
                  type="text"
                  formControlName="username"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
              </div>

              <!-- Email -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  [disabled]="true">
              </div>

              <!-- First Name -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">First Name</label>
                <input
                  type="text"
                  formControlName="firstName"
                  placeholder="Enter first name"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
              </div>

              <!-- Last Name -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Last Name</label>
                <input
                  type="text"
                  formControlName="lastName"
                  placeholder="Enter last name"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
              </div>
            </div>

            @if (profileMessage()) {
              <div class="mb-4 p-4 rounded-lg border" [ngClass]="{'bg-green-500/20 border-green-500': profileMessage()!.type === 'success', 'bg-red-500/20 border-red-500': profileMessage()!.type === 'error'}">
                <p [ngClass]="{'text-green-400': profileMessage()!.type === 'success', 'text-red-400': profileMessage()!.type === 'error'}">
                  {{ profileMessage()!.text }}
                </p>
              </div>
            }

            <button
              type="submit"
              [disabled]="profileForm.invalid || profileProcessing()"
              class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors">
              @if (profileProcessing()) {
                Saving...
              } @else {
                Save Changes
              }
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 mb-6 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-6">Change Password</h2>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="space-y-4 mb-6">
              <!-- Current Password -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Current Password</label>
                <input
                  type="password"
                  formControlName="currentPassword"
                  placeholder="Enter current password"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
              </div>

              <!-- New Password -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">New Password</label>
                <input
                  type="password"
                  formControlName="newPassword"
                  placeholder="Enter new password"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
                @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.errors?.['minlength']) {
                  <p class="text-red-400 text-sm mt-1">Password must be at least 8 characters</p>
                }
              </div>

              <!-- Confirm Password -->
              <div>
                <label class="block text-gray-200 mb-2 font-semibold">Confirm New Password</label>
                <input
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Confirm new password"
                  class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500">
                @if (passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched) {
                  <p class="text-red-400 text-sm mt-1">Passwords do not match</p>
                }
              </div>
            </div>

            @if (passwordMessage()) {
              <div class="mb-4 p-4 rounded-lg border" [ngClass]="{'bg-green-500/20 border-green-500': passwordMessage()!.type === 'success', 'bg-red-500/20 border-red-500': passwordMessage()!.type === 'error'}">
                <p [ngClass]="{'text-green-400': passwordMessage()!.type === 'success', 'text-red-400': passwordMessage()!.type === 'error'}">
                  {{ passwordMessage()!.text }}
                </p>
              </div>
            }

            <button
              type="submit"
              [disabled]="passwordForm.invalid || passwordProcessing()"
              class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors">
              @if (passwordProcessing()) {
                Updating...
              } @else {
                Update Password
              }
            </button>
          </form>
        </div>

        <!-- Account Actions -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 md:p-8 border border-white/20">
          <h2 class="text-2xl font-bold text-white mb-6">Account Actions</h2>
          <div class="space-y-4">
            <button
              class="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Request Account Data (GDPR)
            </button>
            <button
              class="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors ml-0 md:ml-4">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileProcessing = signal<boolean>(false);
  passwordProcessing = signal<boolean>(false);
  profileMessage = signal<{type: string, text: string} | null>(null);
  passwordMessage = signal<{type: string, text: string} | null>(null);

  profileForm = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    firstName: [''],
    lastName: ['']
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        });
      },
      error: (error) => console.error('Failed to load profile:', error)
    });
  }

  passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.profileProcessing.set(true);
      this.profileMessage.set(null);

      this.authService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.profileProcessing.set(false);
          this.profileMessage.set({ type: 'success', text: 'Profile updated successfully!' });
        },
        error: (error: any) => {
          this.profileProcessing.set(false);
          this.profileMessage.set({ type: 'error', text: error.error?.message || 'Failed to update profile' });
        }
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.passwordProcessing.set(true);
      this.passwordMessage.set(null);

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.authService.changePassword(currentPassword!, newPassword!).subscribe({
        next: () => {
          this.passwordProcessing.set(false);
          this.passwordMessage.set({ type: 'success', text: 'Password updated successfully!' });
          this.passwordForm.reset();
        },
        error: (error: any) => {
          this.passwordProcessing.set(false);
          this.passwordMessage.set({ type: 'error', text: error.error?.message || 'Failed to change password' });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
