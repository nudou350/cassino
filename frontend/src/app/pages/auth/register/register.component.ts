import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../core/validators/password-match.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form with validators
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      ageConfirm: [false, [Validators.requiredTrue]],
      termsAccept: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator() });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { username, email, password } = this.registerForm.value;

    this.authService.register({ username, email, password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Registration successful:', response);
        this.router.navigate(['/games']);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get ageConfirm() {
    return this.registerForm.get('ageConfirm');
  }

  get termsAccept() {
    return this.registerForm.get('termsAccept');
  }
}
