import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum CalendarIntegrationType {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export class CalendarCredentialsDto {
  @IsEnum(CalendarIntegrationType)
  @IsNotEmpty()
  type: CalendarIntegrationType;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @IsString()
  @IsOptional()
  redirectUri?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
}
