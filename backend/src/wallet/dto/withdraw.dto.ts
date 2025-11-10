import { IsNumber, IsEnum, Min } from 'class-validator';
import { PaymentMethod } from '../entities/transaction.entity';

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
