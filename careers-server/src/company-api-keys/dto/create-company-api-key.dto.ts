import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCompanyApiKeyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
