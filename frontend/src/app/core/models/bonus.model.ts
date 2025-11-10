export interface Bonus {
  id: string;
  type: 'WELCOME' | 'DEPOSIT' | 'FREE_SPINS' | 'CASHBACK' | 'RELOAD' | 'VIP' | 'REFERRAL';
  amount: number;
  wageringRequirement: number;
  wageredAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface BonusTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  amount: number;
  wageringRequirement: number;
  expiresInDays?: number;
  isActive: boolean;
}
