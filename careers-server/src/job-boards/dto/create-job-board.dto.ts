import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateJobBoardDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @IsEnum(['greenhouse', 'ashby', 'custom'])
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  slug?: string;
}
