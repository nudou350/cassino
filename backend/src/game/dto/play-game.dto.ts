import { IsNumber, IsOptional, IsString, IsBoolean, Min, IsObject } from 'class-validator';

export class PlayGameDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsOptional()
  @IsString()
  clientSeed?: string;

  @IsOptional()
  @IsBoolean()
  isDemo?: boolean;

  @IsOptional()
  @IsObject()
  gameData?: any; // Game-specific data (e.g., selected numbers for Keno)
}
