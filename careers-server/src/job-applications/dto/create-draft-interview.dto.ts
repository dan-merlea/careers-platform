import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDraftInterviewDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  stage?: string;

  @IsString()
  @IsOptional()
  processId?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
