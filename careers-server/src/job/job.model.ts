// Using any types since we're using Mongoose schemas instead of these models
type Department = any;
type Office = any;

export interface Job {
  id: string;
  internalId: string;
  title: string;
  company: string; // Company ID reference
  location: string;
  publishedDate: Date;
  updatedAt: Date;
  content: string; // HTML content
  departments: Department[] | string[]; // Can be either Department objects or just the department IDs
  offices: Office[] | string[]; // Can be either Office objects or just the office IDs
  status: JobStatus;
  createdAt: Date;
  jobBoardId?: string; // Reference to the job board
}

export enum JobStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface JobCreateDto {
  internalId: string;
  title: string;
  companyId: string;
  location: string;
  content: string;
  departmentIds: string[];
  officeIds: string[];
  status?: JobStatus;
  jobBoardId?: string;
}

export interface JobUpdateDto {
  internalId?: string;
  title?: string;
  companyId?: string;
  location?: string;
  content?: string;
  departmentIds?: string[];
  officeIds?: string[];
  status?: JobStatus;
  jobBoardId?: string;
}

export interface JobResponseDto {
  id: string;
  internalId: string;
  title: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  location: string;
  publishedDate: Date;
  updatedAt: Date;
  createdAt: Date;
  content: string;
  departments: {
    id: string;
    name: string;
  }[];
  offices: {
    id: string;
    name: string;
    location: string;
  }[];
  status: JobStatus;
  rejectionReason?: string;
  jobBoardId?: string;
}
