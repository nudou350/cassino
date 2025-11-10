import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider, ProviderType } from '../entities/provider.entity';

@Injectable()
export class ProviderSeeder {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async seed(): Promise<void> {
    console.log('🎰 Seeding game providers...');

    const providers = [
      {
        name: 'PG Soft',
        code: 'PGSOFT',
        type: ProviderType.SLOTS,
        isActive: true,
        description: 'PG Soft - Mobile-first game provider with stunning visuals',
        logoUrl: 'https://cdn.pgsoft.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://m.pgsoft-games.com/',
        },
      },
      {
        name: 'Pragmatic Play',
        code: 'PRAGMATIC',
        type: ProviderType.BOTH,
        isActive: true,
        description: 'Pragmatic Play - Leading provider of slots and live casino games',
        logoUrl: 'https://cdn.pragmaticplay.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do',
        },
      },
      {
        name: 'Hacksaw Gaming',
        code: 'HACKSAW',
        type: ProviderType.SLOTS,
        isActive: true,
        description: 'Hacksaw Gaming - Innovative high-volatility slot games',
        logoUrl: 'https://cdn.hacksaw.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://loader-iframe.hacksaw.link/',
        },
      },
      {
        name: 'No Limit City',
        code: 'NOLIMIT',
        type: ProviderType.SLOTS,
        isActive: true,
        description: 'No Limit City - Extreme volatility slots with massive win potential',
        logoUrl: 'https://cdn.nolimitcity.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://game-launcher.nolimitcity.com/',
        },
      },
      {
        name: 'Endorphina',
        code: 'ENDORPHINA',
        type: ProviderType.SLOTS,
        isActive: true,
        description: 'Endorphina - Certified slots with unique themes',
        logoUrl: 'https://cdn.endorphina.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://game.endorphina.com/',
        },
      },
      {
        name: 'Yggdrasil',
        code: 'YGGDRASIL',
        type: ProviderType.SLOTS,
        isActive: true,
        description: 'Yggdrasil - Premium slots with innovative mechanics',
        logoUrl: 'https://cdn.yggdrasilgaming.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://launcher.yggdrasilgaming.com/',
        },
      },
      {
        name: 'Push Gaming',
        code: 'PUSH',
        type: ProviderType.SLOTS,
        isActive: true,
        description: 'Push Gaming - Creative slots with cluster pays mechanics',
        logoUrl: 'https://cdn.pushgaming.com/logo.png',
        configuration: {
          launchBaseUrl: 'https://games.pushgaming.com/',
        },
      },
      {
        name: 'House',
        code: 'HOUSE',
        type: ProviderType.IN_HOUSE,
        isActive: true,
        description: 'In-house developed games with provably fair technology',
        configuration: {},
      },
    ];

    for (const providerData of providers) {
      const existing = await this.providerRepository.findOne({
        where: { code: providerData.code },
      });

      if (!existing) {
        const provider = this.providerRepository.create(providerData);
        await this.providerRepository.save(provider);
        console.log(`  ✅ Created provider: ${providerData.name}`);
      } else {
        console.log(`  ⏭️  Provider already exists: ${providerData.name}`);
      }
    }

    console.log('✅ Game providers seeded successfully');
  }
}
