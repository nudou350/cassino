import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <header class="header">
        <h1>🎰 Casino Platform</h1>
        <nav>
          <a routerLink="/home">Home</a>
          <a routerLink="/games">Games</a>
          <a routerLink="/login">Login</a>
        </nav>
      </header>
      <main>
        <router-outlet />
      </main>
      <footer>
        <p>&copy; 2025 Casino Platform. Play Responsibly.</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .header nav {
      margin-top: 1rem;
      display: flex;
      gap: 1.5rem;
    }

    .header nav a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .header nav a:hover {
      opacity: 0.8;
    }

    main {
      flex: 1;
      padding: 2rem;
    }

    footer {
      background: #333;
      color: white;
      padding: 1rem;
      text-align: center;
    }
  `]
})
export class AppComponent {
  title = 'Casino Platform';
}
