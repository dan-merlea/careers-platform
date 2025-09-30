import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';

export enum ApprovalType {
  HEADCOUNT = 'headcount',
  JOB_OPENING = 'job-opening',
}

export enum EmailCalendarProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  OTHER = 'other',
}

export class CompanySettingsDto {
  @IsEnum(ApprovalType)
  @IsOptional()
  approvalType?: ApprovalType;

  @IsEnum(EmailCalendarProvider)
  @IsOptional()
  emailCalendarProvider?: EmailCalendarProvider;

  // Not technically part of the nested settings object in the schema, but we allow updating it via the same endpoint
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedDomains?: string[];
}
