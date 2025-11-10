import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './user/user.service';
import { Repository } from 'typeorm';
import { User } from './user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function addBalance() {
  console.log('💰 Adding balance to all users...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Get all users
    const users = await userRepository.find();

    console.log(`Found ${users.length} users`);

    // Update all users to have at least $500
    for (const user of users) {
      if (Number(user.balance) < 500) {
        user.balance = 500;
        await userRepository.save(user);
        console.log(`✅ Added balance to user: ${user.username} (${user.email})`);
      } else {
        console.log(`✓ User ${user.username} already has sufficient balance`);
      }
    }

    console.log('✅ Balance update completed successfully!');
  } catch (error) {
    console.error('❌ Error adding balance:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

addBalance();
