import { IsEnum, IsOptional } from 'class-validator';

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
}
