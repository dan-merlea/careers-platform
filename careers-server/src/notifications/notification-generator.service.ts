import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './schemas/notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from '../job/job.entity';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class NotificationGeneratorService {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Generate notifications for a new job application
   * Notifies the recruiter who created the job and the hiring manager
   */
  async notifyJobApplication(
    jobId: string,
    applicantName: string,
    applicantId: string,
  ): Promise<void> {
    try {
      // Find the job to get the recruiter and hiring manager
      const job = await this.jobModel.findById(jobId)
        .populate('createdBy')
        .populate('hiringManagerId')
        .exec();

      if (!job) {
        console.error(`Job with ID ${jobId} not found for notification`);
        return;
      }
      
      // Notify the recruiter who created the job
      if (job.createdBy) {
        const recruiterId = this.getStringId(job.createdBy);
        if (recruiterId) {
          await this.notificationsService.create({
            userId: recruiterId,
            title: 'New Job Application',
            message: `${applicantName} has applied for the ${job.title} position.`,
            type: NotificationType.JOB_APPLICATION,
            data: {
              jobId: this.getStringId(job._id),
              applicantId,
              jobTitle: job.title,
            },
          });
        }
      }

      // Notify the hiring manager
      if (job.hiringManagerId) {
        const hiringManagerId = this.getStringId(job.hiringManagerId);
        if (hiringManagerId) {
          // Don't send duplicate notifications if the hiring manager is the same as the recruiter
          const createdById = job.createdBy ? this.getStringId(job.createdBy) : null;
          if (!createdById || createdById !== hiringManagerId) {
            await this.notificationsService.create({
              userId: hiringManagerId,
              title: 'New Job Application',
              message: `${applicantName} has applied for the ${job.title} position.`,
              type: NotificationType.JOB_APPLICATION,
              data: {
                jobId: this.getStringId(job._id),
                applicantId,
                jobTitle: job.title,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating job application notification:', error);
    }
  }

  /**
   * Helper method to safely convert an ObjectId or any other value to a string
   */
  private getStringId(value: any): string | null {
    if (!value) return null;
    
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }
    
    if (typeof value === 'object' && value._id) {
      return value._id.toString();
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    try {
      return String(value);
    } catch {
      return null;
    }
  }
}
