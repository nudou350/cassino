import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="hero">
        <h1>Welcome to the Casino Platform</h1>
        <p class="subtitle">Experience the thrill of casino gaming with provably fair games</p>
        <div class="cta-buttons">
          <button class="btn btn-primary">Get Started</button>
          <button class="btn btn-secondary">Play Demo</button>
        </div>
      </div>

      <div class="features">
        <h2>Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="icon">🎰</div>
            <h3>Slot Machines</h3>
            <p>Classic slots with exciting themes and big jackpots</p>
          </div>
          <div class="feature-card">
            <div class="icon">🃏</div>
            <h3>Blackjack</h3>
            <p>Beat the dealer in this classic card game</p>
          </div>
          <div class="feature-card">
            <div class="icon">🎲</div>
            <h3>Roulette</h3>
            <p>Spin the wheel and win big on European Roulette</p>
          </div>
          <div class="feature-card">
            <div class="icon">✅</div>
            <h3>Provably Fair</h3>
            <p>Transparent and verifiable game outcomes</p>
          </div>
          <div class="feature-card">
            <div class="icon">💰</div>
            <h3>Bonuses</h3>
            <p>Welcome bonuses and regular promotions</p>
          </div>
          <div class="feature-card">
            <div class="icon">🔒</div>
            <h3>Secure</h3>
            <p>Your funds and data are safe with us</p>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2>Play Responsibly</h2>
        <p>
          We are committed to responsible gaming. Set your limits, take breaks,
          and remember that gambling should be entertainment, not a way to make money.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 3rem;
    }

    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-primary {
      background: #ffd700;
      color: #333;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
    }

    .features {
      margin-bottom: 3rem;
    }

    .features h2 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 2rem;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
    }

    .info-section {
      background: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }

    .info-section h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .info-section p {
      color: #666;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class HomeComponent {}
