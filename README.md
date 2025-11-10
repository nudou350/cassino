# Casino Platform

A full-featured online casino platform built with Angular and NestJS.

## Project Overview

This is a comprehensive online casino platform that provides users with a secure, engaging, and fair gaming experience. The platform includes various casino games, user account management, payment processing, and responsible gaming features.

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (primary), Redis (caching & sessions)
- **ORM**: TypeORM
- **Authentication**: JWT tokens with refresh token rotation
- **Real-time**: Socket.io (planned)
- **Payment Processing**: Stripe / PayPal integration (planned)
- **Game Engine**: Custom provably fair algorithm implementation

### Frontend (Planned)
- **Framework**: Angular 17+ (standalone components, signals-based state management)
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Real-time Updates**: WebSockets (Socket.io client)

## Current Implementation Status

### ✅ Completed Features

#### Backend Services
1. **Authentication System**
   - User registration and login
   - JWT access and refresh tokens
   - Password hashing with bcrypt
   - Session management
   - Auth guards and strategies

2. **User Management**
   - User profiles with KYC status
   - Responsible gaming limits
   - Self-exclusion options
   - Activity tracking
   - VIP levels

3. **Wallet & Transactions**
   - Multi-currency support structure
   - Deposit and withdrawal processing
   - Transaction history
   - Real-time balance updates
   - Bet and win recording

4. **Game System**
   - Game entities and metadata
   - Game session tracking
   - Support for multiple game types

5. **Provably Fair Engine**
   - Server and client seed generation
   - Cryptographic hash verification
   - Random number generation
   - Outcome verification system

6. **Casino Games**
   - **Slot Machines**: 3-reel slot with weighted symbols and multipliers
   - **Blackjack**: Classic blackjack with dealer AI
   - **Roulette**: European roulette with various bet types

7. **Bonus System**
   - Multiple bonus types (welcome, deposit, cashback, etc.)
   - Wagering requirements tracking
   - Bonus expiration handling
   - Active bonus management

### 🚧 Pending Features
- Angular frontend application
- WebSocket gateway for real-time features
- Admin dashboard
- Leaderboards and social features
- Additional payment integrations

## Project Structure

```
cassino/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User management
│   │   ├── wallet/         # Wallet and transactions
│   │   ├── game/           # Game engine and logic
│   │   │   ├── entities/   # Game entities
│   │   │   ├── services/   # Game implementations
│   │   │   └── dto/        # Data transfer objects
│   │   ├── bonus/          # Bonus system
│   │   ├── database/       # Database utilities (Redis)
│   │   └── common/         # Shared utilities
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Angular frontend (to be implemented)
├── docker-compose.yml       # PostgreSQL and Redis setup
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cassino
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the databases**
   ```bash
   docker-compose up -d
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Run database migrations**
   ```bash
   npm run typeorm migration:run
   ```

6. **Start the backend server**
   ```bash
   npm run start:dev
   ```

The backend API will be available at `http://localhost:3000/api`

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=casino_user
DB_PASSWORD=casino_pass
DB_DATABASE=casino_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/responsible-gaming/limits` - Set gaming limits
- `PUT /api/user/self-exclusion` - Set self-exclusion

### Wallet
- `GET /api/wallet/balance` - Get current balance
- `POST /api/wallet/deposit` - Make a deposit
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/transactions` - Get transaction history

### Games
- `GET /api/games` - List all available games
- `GET /api/games/:id` - Get game details
- `POST /api/games/:id/play` - Play a game
- `GET /api/games/:id/history` - Get game history
- `GET /api/games/sessions/:sessionId/verify` - Verify game outcome

### Bonuses
- `GET /api/bonuses/available` - Get available bonuses
- `POST /api/bonuses/claim` - Claim a bonus
- `GET /api/bonuses/active` - Get active bonuses
- `GET /api/bonuses/history` - Get bonus history

## Game Mechanics

### Provably Fair System

All games use a provably fair algorithm to ensure transparency and fairness:

1. **Server Seed**: Generated randomly by the server
2. **Client Seed**: Provided by the client or generated randomly
3. **Nonce**: Incremental counter for each game round
4. **Combined Hash**: SHA-256 hash of server seed + client seed + nonce

Players can verify game outcomes using the provided seeds and nonce.

### Available Games

#### Slot Machine
- 3 reels with 3 symbols each
- Weighted symbol distribution
- Multipliers: 2x to 50x
- Payline: Middle row

#### Blackjack
- Classic rules
- Dealer hits on 16, stands on 17
- Blackjack pays 3:2
- Push on ties

#### Roulette
- European style (single zero)
- Bet types: straight up (35:1), color (1:1), even/odd (1:1), high/low (1:1)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Refresh token rotation
- Rate limiting (planned)
- Input validation with class-validator
- SQL injection prevention via TypeORM
- XSS protection

## Responsible Gaming

The platform includes responsible gaming features:
- Deposit limits (daily, weekly, monthly)
- Loss limits
- Session time limits
- Self-exclusion options
- Reality checks (planned)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

### Backend Development
```bash
cd backend
npm run start:dev
```

The backend will run on `http://localhost:3000` with hot reload enabled.

### Database Management

```bash
# Generate a new migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

## Deployment

(To be documented - deployment strategies for production)

## Contributing

(To be documented - contribution guidelines)

## License

MIT

## Important Notes

⚠️ **This is a demonstration project**. Before deploying to production:

1. Obtain proper gambling licenses
2. Implement comprehensive KYC/AML procedures
3. Add payment gateway integrations
4. Implement fraud detection systems
5. Add comprehensive logging and monitoring
6. Conduct security audits
7. Ensure compliance with local gambling regulations
8. Add age verification
9. Implement geolocation restrictions

## Support

For questions or issues, please open an issue on GitHub.

---

**Last Updated**: November 2025
