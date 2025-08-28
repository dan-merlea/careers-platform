import { IsOptional, IsString } from 'class-validator';

export class UpdateJobFunctionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
