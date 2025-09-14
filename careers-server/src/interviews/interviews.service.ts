import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobApplication, JobApplicationDocument, Interview } from '../job-applications/schemas/job-application.schema';
import { Job, JobDocument } from '../jobs/schemas/job.schema';

// Interview data transfer object
export interface InterviewDto {
  id: string;
  scheduledDate: Date;
  title: string;
  description?: string;
  interviewers: { userId: string; name: string }[];
  stage: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  applicantId: string;
  applicantName: string;
  jobTitle: string;
  processId?: string;
}

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(JobApplication.name) private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
  ) {}

  /**
   * Get all interviews for active applicants
   * Active applicants are those not in 'rejected' or 'hired' status
   */
  async getActiveInterviews(): Promise<InterviewDto[]> {
    const applications = await this.jobApplicationModel
      .find({ 
        status: { $nin: ['rejected', 'hired'] },
        interviews: { $exists: true, $ne: [] }
      })
      .populate('jobId')
      .exec();

    const interviews: InterviewDto[] = [];

    // Extract interviews from applications and add applicant info
    for (const application of applications as JobApplicationDocument[]) {
      if (application.interviews && application.interviews.length > 0) {
        const job = application.jobId as any;
        const jobTitle = job ? job.title : 'Unknown Position';
        
        for (const interview of application.interviews) {
          if (interview._id) {
            interviews.push({
              id: interview._id.toString(),
              scheduledDate: interview.scheduledDate,
              title: interview.title,
              description: interview.description,
              interviewers: interview.interviewers.map((interviewer) => ({
                userId: interviewer.userId.toString(),
                name: interviewer.name,
              })),
              stage: interview.stage,
              status: interview.status,
              createdAt: interview.createdAt,
              updatedAt: interview.updatedAt,
              applicantId: (application._id as unknown as Types.ObjectId).toString(),
              applicantName: `${application.firstName} ${application.lastName}`,
              jobTitle: jobTitle,
            });
          }
        }
      }
    }

    // Sort by scheduled date (most recent first)
    return interviews.sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }

  /**
   * Get all upcoming interviews (scheduled for today or in the future)
   */
  async getUpcomingInterviews(): Promise<InterviewDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const applications = await this.jobApplicationModel
      .find({
        'interviews.scheduledDate': { $gte: today }
      })
      .populate('jobId')
      .exec();

    const interviews: InterviewDto[] = [];

    // Extract upcoming interviews from applications
    for (const application of applications as JobApplicationDocument[]) {
      if (application.interviews && application.interviews.length > 0) {
        const job = application.jobId as any;
        const jobTitle = job ? job.title : 'Unknown Position';
        
        const upcomingInterviews = application.interviews.filter(
          (interview) => new Date(interview.scheduledDate) >= today
        );
        
        for (const interview of upcomingInterviews) {
          if (interview._id) {
            interviews.push({
              id: interview._id.toString(),
              scheduledDate: interview.scheduledDate,
              title: interview.title,
              description: interview.description,
              interviewers: interview.interviewers.map((interviewer) => ({
                userId: interviewer.userId.toString(),
                name: interviewer.name,
              })),
              stage: interview.stage,
              status: interview.status,
              createdAt: interview.createdAt,
              updatedAt: interview.updatedAt,
              applicantId: (application._id as unknown as Types.ObjectId).toString(),
              applicantName: `${application.firstName} ${application.lastName}`,
              jobTitle: jobTitle,
            });
          }
        }
      }
    }

    // Sort by scheduled date (soonest first)
    return interviews.sort((a, b) => 
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  /**
   * Get interview by ID
   */
  async getInterviewById(interviewId: string): Promise<InterviewDto> {
    const application = (await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .populate('jobId')
      .exec()) as JobApplicationDocument;

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interview = application.interviews.find(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (!interview || !interview._id) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const job = application.jobId as any;
    const jobTitle = job ? job.title : 'Unknown Position';

    return {
      id: interview._id.toString(),
      scheduledDate: interview.scheduledDate,
      title: interview.title,
      description: interview.description,
      interviewers: interview.interviewers.map((interviewer) => ({
        userId: interviewer.userId.toString(),
        name: interviewer.name,
      })),
      stage: interview.stage,
      status: interview.status,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      applicantId: (application._id as unknown as Types.ObjectId).toString(),
      applicantName: `${application.firstName} ${application.lastName}`,
      jobTitle: jobTitle,
      processId: interview.processId ? interview.processId.toString() : undefined,
    };
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(interviewId: string, reason: string): Promise<InterviewDto> {
    console.log(`Attempting to cancel interview with ID: ${interviewId}, reason: ${reason}`);
    
    try {
      // Convert string ID to ObjectId
      const objectId = new Types.ObjectId(interviewId);
      console.log('Created ObjectId:', objectId);
      
      // Find the application containing this interview
      const application = await this.jobApplicationModel
        .findOne({ 'interviews._id': objectId })
        .populate('jobId')
        .exec();
      
      console.log('Found application:', application ? 'Yes' : 'No');
      
      if (!application) {
        console.log(`No application found with interview ID ${interviewId}`);
        throw new NotFoundException(`Interview with ID ${interviewId} not found`);
      }
      
      // Find the interview in the application's interviews array
      const interviewIndex = application.interviews.findIndex(
        (i) => i._id && i._id.toString() === interviewId
      );
      
      console.log(`Interview index in array: ${interviewIndex}`);
      
      if (interviewIndex === -1) {
        console.log(`Interview with ID ${interviewId} not found in application's interviews array`);
        throw new NotFoundException(`Interview with ID ${interviewId} not found`);
      }
      
      console.log('Before update:', {
        status: application.interviews[interviewIndex].status,
        reason: application.interviews[interviewIndex].cancellationReason
      });
      
      // Update the interview status to cancelled
      application.interviews[interviewIndex].status = 'cancelled';
      application.interviews[interviewIndex].cancellationReason = reason;
      application.interviews[interviewIndex].updatedAt = new Date();
      
      console.log('After update:', {
        status: application.interviews[interviewIndex].status,
        reason: application.interviews[interviewIndex].cancellationReason
      });
      
      // Save the changes
      await application.save();
      console.log('Application saved successfully');
      
      // Return the updated interview
      return this.getInterviewById(interviewId);
    } catch (error) {
      console.error('Error in cancelInterview:', error);
      throw error;
    }
  }

  /**
   * Reschedule an interview
   */
  async rescheduleInterview(interviewId: string, scheduledDate: Date): Promise<InterviewDto> {
    const application = (await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .populate('jobId')
      .exec()) as JobApplicationDocument;

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Update the interview scheduled date
    application.interviews[interviewIndex].scheduledDate = scheduledDate;
    application.interviews[interviewIndex].updatedAt = new Date();

    await application.save();

    // Return the updated interview
    return this.getInterviewById(interviewId);
  }

  /**
   * Update interviewers for an interview
   */
  async updateInterviewers(interviewId: string, interviewers: { userId: string; name: string }[]): Promise<InterviewDto> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Update the interviewers
    application.interviews[interviewIndex].interviewers = interviewers.map(interviewer => ({
      userId: new Types.ObjectId(interviewer.userId),
      name: interviewer.name
    }));
    
    application.interviews[interviewIndex].updatedAt = new Date();

    await application.save();

    // Return the updated interview
    return this.getInterviewById(interviewId);
  }

  /**
   * Get all feedback for an interview
   */
  async getInterviewFeedback(interviewId: string): Promise<any[]> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interview = application.interviews.find(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Return feedback if it exists, otherwise return empty array
    return interview.feedback || [];
  }

  /**
   * Get feedback by interviewer
   */
  async getInterviewerFeedback(interviewId: string, interviewerId: string): Promise<any> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interview = application.interviews.find(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Find feedback by interviewer ID
    const feedback = interview.feedback?.find(
      (f) => f.interviewerId === interviewerId
    );

    if (!feedback) {
      throw new NotFoundException(`Feedback from interviewer ${interviewerId} not found`);
    }

    return feedback;
  }

  /**
   * Submit feedback for an interview
   */
  async submitFeedback(interviewId: string, feedbackData: any): Promise<any> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Initialize feedback array if it doesn't exist
    if (!application.interviews[interviewIndex].feedback) {
      application.interviews[interviewIndex].feedback = [];
    }

    // Check if feedback from this interviewer already exists
    const existingFeedbackIndex = application.interviews[interviewIndex].feedback.findIndex(
      (f) => f.interviewerId === feedbackData.interviewerId
    );

    if (existingFeedbackIndex !== -1) {
      // Update existing feedback
      application.interviews[interviewIndex].feedback[existingFeedbackIndex] = {
        ...feedbackData,
        updatedAt: new Date(),
      };
    } else {
      // Add new feedback
      application.interviews[interviewIndex].feedback.push({
        ...feedbackData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await application.save();

    // Return the updated feedback
    return application.interviews[interviewIndex].feedback.find(
      (f) => f.interviewerId === feedbackData.interviewerId
    );
  }

  /**
   * Update feedback for an interview
   */
  async updateFeedback(interviewId: string, interviewerId: string, feedbackData: any): Promise<any> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Check if feedback array exists
    if (!application.interviews[interviewIndex].feedback) {
      throw new NotFoundException(`Feedback from interviewer ${interviewerId} not found`);
    }

    // Find feedback by interviewer ID
    const feedbackIndex = application.interviews[interviewIndex].feedback.findIndex(
      (f) => f.interviewerId === interviewerId
    );

    if (feedbackIndex === -1) {
      throw new NotFoundException(`Feedback from interviewer ${interviewerId} not found`);
    }

    // Update feedback
    application.interviews[interviewIndex].feedback[feedbackIndex] = {
      ...feedbackData,
      updatedAt: new Date(),
    };

    await application.save();

    // Return the updated feedback
    return application.interviews[interviewIndex].feedback[feedbackIndex];
  }
}
