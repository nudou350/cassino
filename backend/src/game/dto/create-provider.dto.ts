import { IsString, IsEnum, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ProviderType } from '../entities/provider.entity';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(ProviderType)
  type: ProviderType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  apiEndpoint?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsString()
  @IsOptional()
  operatorId?: string;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
