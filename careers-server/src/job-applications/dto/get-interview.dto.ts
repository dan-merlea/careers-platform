import { InterviewerDto } from './schedule-interview.dto';

export class InterviewDto {
  id: string;
  scheduledDate: Date;
  title: string;
  description?: string;
  interviewers: InterviewerDto[];
  stage: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  processId?: string;
}
