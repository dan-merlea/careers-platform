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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
