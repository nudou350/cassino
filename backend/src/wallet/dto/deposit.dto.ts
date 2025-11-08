import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../entities/transaction.entity';

export class DepositDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  externalTransactionId?: string;
}
