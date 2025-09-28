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
  interviewerVisibility?: boolean;
  refereeId?: string;
  refereeName?: string;
  refereeEmail?: string;
  refereeRelationship?: string;
  isReferral?: boolean;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}
