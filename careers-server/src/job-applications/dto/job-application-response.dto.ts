export interface InterviewStageDto {
  id: string;
  title: string;
  order: number;
  processId: string;
  emailTemplate?: string;
  color: string;
}

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
  progress?: number; // Application progress percentage (0-100)
  stages?: InterviewStageDto[]; // Complete list of stages for this application
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
