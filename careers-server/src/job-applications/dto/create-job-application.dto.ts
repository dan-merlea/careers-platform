import { IsEmail, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateJobApplicationDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  consentDuration: number;

  @IsNotEmpty()
  @IsMongoId()
  jobId: string;

  // The file will be handled separately through the file interceptor
}
