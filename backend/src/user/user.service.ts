import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with initial balance
    const user = this.userRepository.create({
      email,
      username,
      passwordHash,
      balance: 500, // Starting balance for testing
      bonusBalance: 0,
    });

    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async updateBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    user.balance = Number(user.balance) + amount;
    return await this.userRepository.save(user);
  }

  async updateBonusBalance(userId: string, amount: number): Promise<User> {
    const user = await this.findById(userId);
    user.bonusBalance = Number(user.bonusBalance) + amount;
    return await this.userRepository.save(user);
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.findById(userId);
    const { passwordHash, refreshToken, twoFactorSecret, ...profile } = user;
    return profile;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return await this.findById(userId);
  }

  async setResponsibleGamingLimits(
    userId: string,
    limits: {
      dailyDepositLimit?: number;
      weeklyDepositLimit?: number;
      monthlyDepositLimit?: number;
      dailyLossLimit?: number;
      weeklyLossLimit?: number;
      monthlyLossLimit?: number;
      sessionTimeLimit?: number;
    },
  ): Promise<User> {
    await this.userRepository.update(userId, limits);
    return await this.findById(userId);
  }

  async setSelfExclusion(userId: string, until: Date): Promise<User> {
    await this.userRepository.update(userId, { selfExcludedUntil: until });
    return await this.findById(userId);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash);
  }

  async updateLastLogin(userId: string, ip: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }
}
