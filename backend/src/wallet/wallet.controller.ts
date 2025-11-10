import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return await this.walletService.getBalance(req.user.id);
  }

  @Post('deposit')
  async deposit(@Request() req, @Body() depositDto: DepositDto) {
    return await this.walletService.deposit(
      req.user.id,
      depositDto.amount,
      depositDto.paymentMethod,
      depositDto.externalTransactionId,
    );
  }

  @Post('withdraw')
  async withdraw(@Request() req, @Body() withdrawDto: WithdrawDto) {
    return await this.walletService.withdraw(
      req.user.id,
      withdrawDto.amount,
      withdrawDto.paymentMethod,
    );
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.walletService.getTransactions(
      req.user.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('transactions/:id')
  async getTransaction(@Request() req, @Param('id') id: string) {
    return await this.walletService.getTransactionById(id, req.user.id);
  }
}
