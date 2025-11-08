import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Bonus, BonusType, BonusStatus } from './entities/bonus.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(Bonus)
    private bonusRepository: Repository<Bonus>,
    private userService: UserService,
  ) {}

  async getAvailableBonuses(): Promise<any[]> {
    // Return template bonuses available for claiming
    return [
      {
        type: BonusType.WELCOME,
        amount: 100,
        wageringRequirement: 3000,
        description: 'Welcome bonus - 100% match up to $100',
        validDays: 30,
      },
      {
        type: BonusType.DEPOSIT,
        amount: 50,
        wageringRequirement: 1500,
        description: 'Deposit bonus - 50% match up to $50',
        validDays: 7,
      },
      {
        type: BonusType.CASHBACK,
        amount: 25,
        wageringRequirement: 250,
        description: 'Weekly cashback - 10% up to $25',
        validDays: 7,
      },
    ];
  }

  async claimBonus(
    userId: string,
    bonusType: BonusType,
    amount: number,
  ): Promise<Bonus> {
    const user = await this.userService.findById(userId);

    // Check if user already has an active bonus of this type
    const existingBonus = await this.bonusRepository.findOne({
      where: {
        userId,
        type: bonusType,
        status: BonusStatus.ACTIVE,
      },
    });

    if (existingBonus) {
      throw new BadRequestException(
        'You already have an active bonus of this type',
      );
    }

    // Create bonus with wagering requirement (typically 30x)
    const wageringMultiplier = 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const bonus = this.bonusRepository.create({
      userId,
      type: bonusType,
      amount,
      wageringRequirement: amount * wageringMultiplier,
      status: BonusStatus.ACTIVE,
      expiresAt,
      description: this.getBonusDescription(bonusType),
    });

    const savedBonus = await this.bonusRepository.save(bonus);

    // Add to user's bonus balance
    await this.userService.updateBonusBalance(userId, amount);

    return savedBonus;
  }

  async getActiveBonuses(userId: string): Promise<Bonus[]> {
    return await this.bonusRepository.find({
      where: {
        userId,
        status: BonusStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getBonusHistory(userId: string): Promise<Bonus[]> {
    return await this.bonusRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async trackWagering(userId: string, wagerAmount: number): Promise<void> {
    const activeBonuses = await this.getActiveBonuses(userId);

    for (const bonus of activeBonuses) {
      if (bonus.wageredAmount < bonus.wageringRequirement) {
        bonus.wageredAmount = Number(bonus.wageredAmount) + wagerAmount;

        // Check if wagering requirement is met
        if (bonus.wageredAmount >= bonus.wageringRequirement) {
          bonus.status = BonusStatus.COMPLETED;
          bonus.wageredAmount = bonus.wageringRequirement;
        }

        await this.bonusRepository.save(bonus);
      }
    }
  }

  async expireBonuses(): Promise<void> {
    const expiredBonuses = await this.bonusRepository.find({
      where: {
        status: BonusStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const bonus of expiredBonuses) {
      bonus.status = BonusStatus.EXPIRED;
      await this.bonusRepository.save(bonus);

      // Deduct from user's bonus balance
      await this.userService.updateBonusBalance(
        bonus.userId,
        -Number(bonus.amount),
      );
    }

    console.log(`✅ Expired ${expiredBonuses.length} bonuses`);
  }

  async cancelBonus(bonusId: string, userId: string): Promise<Bonus> {
    const bonus = await this.bonusRepository.findOne({
      where: { id: bonusId, userId },
    });

    if (!bonus) {
      throw new NotFoundException('Bonus not found');
    }

    if (bonus.status !== BonusStatus.ACTIVE) {
      throw new BadRequestException('Bonus is not active');
    }

    bonus.status = BonusStatus.CANCELLED;
    await this.bonusRepository.save(bonus);

    // Deduct from user's bonus balance
    await this.userService.updateBonusBalance(userId, -Number(bonus.amount));

    return bonus;
  }

  private getBonusDescription(type: BonusType): string {
    const descriptions = {
      [BonusType.WELCOME]: 'Welcome bonus for new players',
      [BonusType.DEPOSIT]: 'Deposit match bonus',
      [BonusType.FREE_SPINS]: 'Free spins bonus',
      [BonusType.CASHBACK]: 'Cashback on losses',
      [BonusType.REFERRAL]: 'Referral bonus',
      [BonusType.VIP]: 'VIP loyalty bonus',
      [BonusType.TOURNAMENT]: 'Tournament prize',
    };
    return descriptions[type] || 'Casino bonus';
  }
}
