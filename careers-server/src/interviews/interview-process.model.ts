export interface Consideration {
  title: string;
  description: string;
}

export interface InterviewStage {
  title: string;
  description: string;
  considerations: Consideration[];
  emailTemplate: string;
  order: number;
}

export interface InterviewProcess {
  id?: string;
  jobRoleId: string;
  stages: InterviewStage[];
  companyId: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InterviewProcessCreateDto {
  jobRoleId: string;
  stages: InterviewStage[];
  companyId?: string; // Optional as it can be set from the authenticated user
}

export interface InterviewProcessUpdateDto {
  jobRoleId?: string;
  stages?: InterviewStage[];
}

export interface InterviewProcessResponseDto {
  id: string;
  jobRole: {
    id: string;
    title: string;
  };
  stages: InterviewStage[];
  company: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
