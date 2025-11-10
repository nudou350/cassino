import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';
import { GameSession } from './entities/game-session.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { ProvablyFairService } from './provably-fair.service';
import { SlotGameService } from './services/slot-game.service';
import { BlackjackService } from './services/blackjack.service';
import { RouletteService } from './services/roulette.service';
import { ScratchCardService } from './services/scratch-card.service';
import { KenoService } from './services/keno.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameSession]),
    UserModule,
    WalletModule,
  ],
  controllers: [GameController],
  providers: [
    GameService,
    ProvablyFairService,
    SlotGameService,
    BlackjackService,
    RouletteService,
    ScratchCardService,
    KenoService,
  ],
  exports: [GameService, ProvablyFairService],
})
export class GameModule {}
