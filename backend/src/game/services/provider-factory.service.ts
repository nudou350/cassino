import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Provider } from '../entities/provider.entity';
import { IGameProvider } from '../interfaces/game-provider.interface';
import { PGSoftProvider } from '../providers/pgsoft.provider';
import { PragmaticProvider } from '../providers/pragmatic.provider';
import { HacksawProvider } from '../providers/hacksaw.provider';
import { NoLimitProvider } from '../providers/nolimit.provider';
import { EndorphinaProvider } from '../providers/endorphina.provider';
import { YggdrasilProvider } from '../providers/yggdrasil.provider';
import { PushGamingProvider } from '../providers/push.provider';

@Injectable()
export class ProviderFactoryService {
  private providerInstances: Map<string, IGameProvider> = new Map();

  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    private readonly httpService: HttpService,
  ) {}

  async getProvider(providerCode: string): Promise<IGameProvider> {
    // Check if provider instance already exists in cache
    if (this.providerInstances.has(providerCode)) {
      return this.providerInstances.get(providerCode);
    }

    // Fetch provider configuration from database
    const provider = await this.providerRepository.findOne({
      where: { code: providerCode, isActive: true },
    });

    if (!provider) {
      throw new NotFoundException(`Provider ${providerCode} not found or inactive`);
    }

    // Create provider instance based on code
    const providerInstance = this.createProviderInstance(provider);

    // Cache the instance
    this.providerInstances.set(providerCode, providerInstance);

    return providerInstance;
  }

  private createProviderInstance(provider: Provider): IGameProvider {
    switch (provider.code) {
      case 'PGSOFT':
        return new PGSoftProvider(provider, this.httpService);
      case 'PRAGMATIC':
        return new PragmaticProvider(provider, this.httpService);
      case 'HACKSAW':
        return new HacksawProvider(provider, this.httpService);
      case 'NOLIMIT':
        return new NoLimitProvider(provider, this.httpService);
      case 'ENDORPHINA':
        return new EndorphinaProvider(provider, this.httpService);
      case 'YGGDRASIL':
        return new YggdrasilProvider(provider, this.httpService);
      case 'PUSH':
        return new PushGamingProvider(provider, this.httpService);
      default:
        throw new NotFoundException(`Provider implementation not found for ${provider.code}`);
    }
  }

  async getAllProviders(): Promise<Provider[]> {
    return this.providerRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async clearCache(providerCode?: string): Promise<void> {
    if (providerCode) {
      this.providerInstances.delete(providerCode);
    } else {
      this.providerInstances.clear();
    }
  }

  getSupportedProviders(): string[] {
    return [
      'PGSOFT',
      'PRAGMATIC',
      'HACKSAW',
      'NOLIMIT',
      'ENDORPHINA',
      'YGGDRASIL',
      'PUSH',
    ];
  }
}
