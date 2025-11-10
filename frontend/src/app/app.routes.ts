import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  // Game routes (protected)
  {
    path: 'games',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/games/games-lobby/games-lobby.component').then(m => m.GamesLobbyComponent)
      },
      {
        path: 'slot/:id',
        loadComponent: () => import('./pages/games/slot-machine/slot-machine.component').then(m => m.SlotMachineComponent)
      },
      {
        path: 'blackjack/:id',
        loadComponent: () => import('./pages/games/blackjack/blackjack.component').then(m => m.BlackjackComponent)
      },
      {
        path: 'roulette/:id',
        loadComponent: () => import('./pages/games/roulette/roulette.component').then(m => m.RouletteComponent)
      },
      {
        path: 'scratch_card/:id',
        loadComponent: () => import('./pages/games/scratch-card/scratch-card.component').then(m => m.ScratchCardComponent)
      },
      {
        path: 'keno/:id',
        loadComponent: () => import('./pages/games/keno/keno.component').then(m => m.KenoComponent)
      }
    ]
  },
  // Wallet routes (protected)
  {
    path: 'wallet',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/wallet/wallet-dashboard/wallet-dashboard.component').then(m => m.WalletDashboardComponent)
      },
      {
        path: 'deposit',
        loadComponent: () => import('./pages/wallet/deposit/deposit.component').then(m => m.DepositComponent)
      },
      {
        path: 'withdraw',
        loadComponent: () => import('./pages/wallet/withdraw/withdraw.component').then(m => m.WithdrawComponent)
      }
    ]
  },
  // User dashboard routes (protected)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/user/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent)
      },
      {
        path: 'responsible-gaming',
        loadComponent: () => import('./pages/user/responsible-gaming/responsible-gaming.component').then(m => m.ResponsibleGamingComponent)
      }
    ]
  },
  // 404 Not Found
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
