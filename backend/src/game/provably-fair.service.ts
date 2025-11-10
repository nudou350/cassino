import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ProvablyFairService {
  /**
   * Generate a random server seed
   */
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a random client seed
   */
  generateClientSeed(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a combined seed hash for provably fair outcome
   */
  createCombinedHash(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): string {
    const data = `${serverSeed}:${clientSeed}:${nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a random number between min and max using provably fair algorithm
   */
  generateNumber(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    min: number,
    max: number,
  ): number {
    const hash = this.createCombinedHash(serverSeed, clientSeed, nonce);
    const value = parseInt(hash.substring(0, 8), 16);
    return min + (value % (max - min + 1));
  }

  /**
   * Generate multiple random numbers
   */
  generateNumbers(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    count: number,
    min: number,
    max: number,
  ): number[] {
    const numbers: number[] = [];
    for (let i = 0; i < count; i++) {
      numbers.push(
        this.generateNumber(serverSeed, clientSeed, nonce + i, min, max),
      );
    }
    return numbers;
  }

  /**
   * Verify a game outcome
   */
  verifyOutcome(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    expectedHash: string,
  ): boolean {
    const actualHash = this.createCombinedHash(serverSeed, clientSeed, nonce);
    return actualHash === expectedHash;
  }

  /**
   * Hash server seed for public display (before revealing)
   */
  hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Generate a float between 0 and 1 using provably fair algorithm
   */
  generateFloat(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): number {
    const hash = this.createCombinedHash(serverSeed, clientSeed, nonce);
    const value = parseInt(hash.substring(0, 13), 16);
    return value / 0x1fffffffffffff; // Divide by max 52-bit number
  }

  /**
   * Shuffle an array using Fisher-Yates with provably fair randomness
   */
  shuffleArray<T>(
    array: T[],
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.generateNumber(serverSeed, clientSeed, nonce + i, 0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
