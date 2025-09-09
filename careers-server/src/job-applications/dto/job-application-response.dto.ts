import { ApplicationStatus } from '../schemas/job-application.schema';

export class JobApplicationResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  resumeFilename: string;
  consentDuration: number;
  consentExpiresAt: Date;
  jobId: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}
