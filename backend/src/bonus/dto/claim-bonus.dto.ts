import { IsEnum, IsNumber, Min } from 'class-validator';
import { BonusType } from '../entities/bonus.entity';

export class ClaimBonusDto {
  @IsEnum(BonusType)
  type: BonusType;

  @IsNumber()
  @Min(1)
  amount: number;
}
