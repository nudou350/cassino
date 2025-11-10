export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  balance: number;
  bonusBalance: number;
  vipLevel: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  responsibleGamingLimits?: {
    dailyLimit: number | null;
    weeklyLimit: number | null;
    monthlyLimit: number | null;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
