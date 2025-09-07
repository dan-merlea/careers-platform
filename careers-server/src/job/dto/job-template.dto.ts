import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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

  @IsOptional()
  @IsString()
  companyId?: string;
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

  @IsOptional()
  @IsString()
  companyId?: string;
}

export class JobTemplateResponseDto {
  id: string;
  name: string;
  content: string;
  role: string;
  companyId: string;
  department?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
