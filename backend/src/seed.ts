import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GameService } from './game/game.service';
import { ProviderSeeder } from './game/seeders/provider.seeder';
import { ProviderService } from './game/services/provider.service';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Seed providers first
    console.log('🎰 Seeding game providers...');
    const providerSeeder = app.get(ProviderSeeder);
    await providerSeeder.seed();

    // Seed in-house games
    console.log('\n🎮 Seeding in-house games...');
    const gameService = app.get(GameService);
    await gameService.seedDatabase();

    // Sync games from external providers
    console.log('\n📥 Syncing games from external providers...');
    const providerService = app.get(ProviderService);
    const providers = await providerService.findAll();

    for (const provider of providers) {
      if (provider.code !== 'HOUSE' && provider.isActive) {
        try {
          console.log(`  🔄 Syncing games from ${provider.name}...`);
          const count = await providerService.syncGames(provider.id);
          console.log(`  ✅ Synced ${count} games from ${provider.name}`);
        } catch (error) {
          console.log(`  ⚠️  Failed to sync games from ${provider.name}: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seed();
