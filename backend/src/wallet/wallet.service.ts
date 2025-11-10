import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from './entities/transaction.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private userService: UserService,
  ) {}

  async getBalance(userId: string): Promise<{ balance: number; bonusBalance: number }> {
    const user = await this.userService.findById(userId);
    return {
      balance: Number(user.balance),
      bonusBalance: Number(user.bonusBalance),
    };
  }

  async deposit(
    userId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    externalTransactionId?: string,
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Create pending transaction
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.PENDING,
      paymentMethod,
      externalTransactionId,
      description: `Deposit via ${paymentMethod}`,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // In a real implementation, you would integrate with payment gateway here
    // For now, we'll auto-complete the transaction
    await this.completeDeposit(savedTransaction.id);

    return await this.transactionRepository.findOne({
      where: { id: savedTransaction.id },
    });
  }

  async completeDeposit(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    // Update user balance
    await this.userService.updateBalance(
      transaction.userId,
      Number(transaction.amount),
    );

    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    return await this.transactionRepository.save(transaction);
  }

  async withdraw(
    userId: string,
    amount: number,
    paymentMethod: PaymentMethod,
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const user = await this.userService.findById(userId);

    if (Number(user.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct from balance immediately
    await this.userService.updateBalance(userId, -amount);

    // Create pending withdrawal transaction
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.WITHDRAWAL,
      amount,
      status: TransactionStatus.PENDING,
      paymentMethod,
      description: `Withdrawal via ${paymentMethod}`,
    });

    return await this.transactionRepository.save(transaction);
  }

  async completeWithdrawal(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    // Update transaction status
    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    return await this.transactionRepository.save(transaction);
  }

  async recordBet(
    userId: string,
    amount: number,
    gameId: string,
  ): Promise<Transaction> {
    const user = await this.userService.findById(userId);

    if (Number(user.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct from balance
    await this.userService.updateBalance(userId, -amount);

    // Create bet transaction
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.BET,
      amount,
      status: TransactionStatus.COMPLETED,
      completedAt: new Date(),
      paymentMethod: PaymentMethod.BALANCE,
      description: `Bet on game ${gameId}`,
      metadata: { gameId },
    });

    return await this.transactionRepository.save(transaction);
  }

  async recordWin(
    userId: string,
    amount: number,
    gameId: string,
  ): Promise<Transaction> {
    // Add to balance
    await this.userService.updateBalance(userId, amount);

    // Create win transaction
    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.WIN,
      amount,
      status: TransactionStatus.COMPLETED,
      completedAt: new Date(),
      paymentMethod: PaymentMethod.BALANCE,
      description: `Win from game ${gameId}`,
      metadata: { gameId },
    });

    return await this.transactionRepository.save(transaction);
  }

  async getTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getTransactionById(
    transactionId: string,
    userId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
