import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobFunctionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  company: string;
}
