import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateJobTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class UpdateJobTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class JobTemplateResponseDto {
  id: string;
  name: string;
  content: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
