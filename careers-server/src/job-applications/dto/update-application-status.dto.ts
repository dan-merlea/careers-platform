import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '../schemas/job-application.schema';

export class UpdateApplicationStatusDto {
  @IsNotEmpty()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
