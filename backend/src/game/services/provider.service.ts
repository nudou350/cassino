import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { Game } from '../entities/game.entity';
import { ProviderFactoryService } from './provider-factory.service';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private providerFactory: ProviderFactoryService,
  ) {}

  async findAll(): Promise<Provider[]> {
    return this.providerRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['games'],
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }

    return provider;
  }

  async findByCode(code: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { code },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with code ${code} not found`);
    }

    return provider;
  }

  async create(providerData: Partial<Provider>): Promise<Provider> {
    const provider = this.providerRepository.create(providerData);
    return this.providerRepository.save(provider);
  }

  async update(id: string, providerData: Partial<Provider>): Promise<Provider> {
    const provider = await this.findOne(id);
    Object.assign(provider, providerData);

    // Clear cache for this provider
    await this.providerFactory.clearCache(provider.code);

    return this.providerRepository.save(provider);
  }

  async remove(id: string): Promise<void> {
    const provider = await this.findOne(id);
    await this.providerRepository.remove(provider);
  }

  async syncGames(providerId: string): Promise<number> {
    const provider = await this.findOne(providerId);

    // Get provider instance
    const providerInstance = await this.providerFactory.getProvider(provider.code);

    // Fetch games from provider
    const providerGames = await providerInstance.fetchGames();

    let syncedCount = 0;

    for (const providerGame of providerGames) {
      // Check if game already exists
      let game = await this.gameRepository.findOne({
        where: {
          externalGameId: providerGame.externalId,
          providerId: provider.id,
        },
      });

      if (!game) {
        // Create new game
        game = this.gameRepository.create({
          name: providerGame.name,
          type: providerGame.type as any,
          provider: provider.name,
          providerId: provider.id,
          externalGameId: providerGame.externalId,
          launchUrl: providerGame.launchUrl,
          thumbnailUrl: providerGame.thumbnailUrl,
          demoAvailable: providerGame.demoAvailable,
          rtpPercentage: providerGame.rtpPercentage || 96.0,
          volatility: (providerGame.volatility as any) || 'MEDIUM',
          minBet: providerGame.minBet || 0.1,
          maxBet: providerGame.maxBet || 100,
          description: providerGame.description,
          configuration: providerGame.configuration,
          isActive: true,
        });
      } else {
        // Update existing game
        game.name = providerGame.name;
        game.thumbnailUrl = providerGame.thumbnailUrl;
        game.demoAvailable = providerGame.demoAvailable;
        game.rtpPercentage = providerGame.rtpPercentage || game.rtpPercentage;
        game.description = providerGame.description;
      }

      await this.gameRepository.save(game);
      syncedCount++;
    }

    return syncedCount;
  }

  async toggleActive(id: string): Promise<Provider> {
    const provider = await this.findOne(id);
    provider.isActive = !provider.isActive;

    // Clear cache for this provider
    await this.providerFactory.clearCache(provider.code);

    return this.providerRepository.save(provider);
  }

  async getProviderStats(id: string): Promise<any> {
    const provider = await this.findOne(id);

    const totalGames = await this.gameRepository.count({
      where: { providerId: id },
    });

    const activeGames = await this.gameRepository.count({
      where: { providerId: id, isActive: true },
    });

    return {
      provider: {
        id: provider.id,
        name: provider.name,
        code: provider.code,
        isActive: provider.isActive,
      },
      stats: {
        totalGames,
        activeGames,
        inactiveGames: totalGames - activeGames,
      },
    };
  }
}
