import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InterviewerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ScheduleInterviewDto {
  @IsDate()
  @Type(() => Date)
  scheduledDate: Date;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewerDto)
  interviewers: InterviewerDto[];

  @IsString()
  @IsOptional()
  processId?: string;

  @IsString()
  @IsNotEmpty()
  stage: string;
}
