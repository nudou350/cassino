import { IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';

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
}
