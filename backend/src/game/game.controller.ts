import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayGameDto } from './dto/play-game.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  async getAllGames() {
    return await this.gameService.getAllGames();
  }

  @Get(':id')
  async getGame(@Param('id') id: string) {
    return await this.gameService.getGameById(id);
  }

  @Post(':id/play')
  @UseGuards(JwtAuthGuard)
  async playGame(
    @Request() req,
    @Param('id') gameId: string,
    @Body() playGameDto: PlayGameDto,
  ) {
    return await this.gameService.playGame(
      req.user.id,
      gameId,
      playGameDto.betAmount,
      playGameDto.clientSeed,
      playGameDto.isDemo || false,
      playGameDto.gameData,
    );
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  async getGameHistory(
    @Request() req,
    @Param('id') gameId: string,
    @Query('limit') limit?: string,
  ) {
    return await this.gameService.getGameHistory(
      req.user.id,
      gameId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('sessions/:sessionId/verify')
  @UseGuards(JwtAuthGuard)
  async verifySession(@Param('sessionId') sessionId: string) {
    const isValid = await this.gameService.verifySession(sessionId);
    return { sessionId, isValid };
  }
}
