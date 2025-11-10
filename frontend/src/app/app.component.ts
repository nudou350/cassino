import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { WalletService } from './core/services/wallet.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  balance = this.walletService.balance;
  mobileMenuOpen = signal(false);

  constructor(
    public authService: AuthService,
    public walletService: WalletService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Fetch balance if authenticated
    if (this.isAuthenticated()) {
      this.walletService.getBalance().subscribe();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        this.router.navigate(['/home']);
      }
    });
  }
}
