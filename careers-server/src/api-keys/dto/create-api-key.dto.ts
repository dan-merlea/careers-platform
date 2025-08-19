import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IntegrationType } from '../api-keys.schema';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsEnum(IntegrationType)
  type: IntegrationType;

  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
