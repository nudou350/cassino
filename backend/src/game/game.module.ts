import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { GameController } from './game.controller';
import { ProviderController } from './provider.controller';
import { GameService } from './game.service';
import { Game } from './entities/game.entity';
import { GameSession } from './entities/game-session.entity';
import { Provider } from './entities/provider.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { ProvablyFairService } from './provably-fair.service';
import { SlotGameService } from './services/slot-game.service';
import { BlackjackService } from './services/blackjack.service';
import { RouletteService } from './services/roulette.service';
import { ScratchCardService } from './services/scratch-card.service';
import { KenoService } from './services/keno.service';
import { ProviderFactoryService } from './services/provider-factory.service';
import { ProviderService } from './services/provider.service';
import { ProviderSeeder } from './seeders/provider.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, GameSession, Provider]),
    HttpModule,
    UserModule,
    WalletModule,
  ],
  controllers: [GameController, ProviderController],
  providers: [
    GameService,
    ProvablyFairService,
    SlotGameService,
    BlackjackService,
    RouletteService,
    ScratchCardService,
    KenoService,
    ProviderFactoryService,
    ProviderService,
    ProviderSeeder,
  ],
  exports: [GameService, ProvablyFairService, ProviderService, ProviderSeeder],
})
export class GameModule {}
