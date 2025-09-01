import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinksDto {
  @IsString()
  @IsOptional()
  linkedin: string;

  @IsString()
  @IsOptional()
  twitter: string;

  @IsString()
  @IsOptional()
  facebook: string;

  @IsString()
  @IsOptional()
  instagram: string;
}

export class CompanyValueDto {
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  icon: string;
}

export class CompanySettingsDto {
  @IsEnum(['headcount', 'job-opening'])
  approvalType: 'headcount' | 'job-opening';
}

export class CompanyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  logo: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  industry: string;

  @IsString()
  @IsOptional()
  foundedYear: string;

  @IsString()
  @IsOptional()
  size: string;

  @IsString()
  @IsOptional()
  headquarters: string;

  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks: SocialLinksDto;

  @IsString()
  @IsOptional()
  mission: string;

  @IsString()
  @IsOptional()
  vision: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyValueDto)
  @IsOptional()
  values: CompanyValueDto[];

  @ValidateNested()
  @Type(() => CompanySettingsDto)
  @IsOptional()
  settings: CompanySettingsDto;
}
