import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClaimBonusDto } from './dto/claim-bonus.dto';

@Controller('bonuses')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get('available')
  async getAvailableBonuses() {
    return await this.bonusService.getAvailableBonuses();
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claimBonus(@Request() req, @Body() claimBonusDto: ClaimBonusDto) {
    return await this.bonusService.claimBonus(
      req.user.id,
      claimBonusDto.type,
      claimBonusDto.amount,
    );
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActiveBonuses(@Request() req) {
    return await this.bonusService.getActiveBonuses(req.user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getBonusHistory(@Request() req) {
    return await this.bonusService.getBonusHistory(req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancelBonus(@Request() req, @Param('id') bonusId: string) {
    return await this.bonusService.cancelBonus(bonusId, req.user.id);
  }
}
