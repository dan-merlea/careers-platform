import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  JobApplication,
  JobApplicationDocument,
  Interview,
} from '../job-applications/schemas/job-application.schema';
import { Job, JobDocument } from '../job/job.entity';
import { User, UserDocument } from '../users/schemas/user.schema';
import { GoogleCalendarService } from '../calendar/google-calendar.service';
import { CompanyService } from '../company/company.service';

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
  googleEventId?: string;
  onlineMeetingUrl?: string;
  meetingId?: string;
  googleMeetingDetails?: {
    meetLink?: string;
    conferenceId?: string;
    htmlLink?: string;
  };
}

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(JobApplication.name)
    private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private googleCalendarService: GoogleCalendarService,
    private companyService: CompanyService,
  ) {}

  /**
   * Get all interviews for active applicants
   * Active applicants are those not in 'rejected' or 'hired' status
   */
  async getActiveInterviews(): Promise<InterviewDto[]> {
    const applications = await this.jobApplicationModel
      .find({
        status: { $nin: ['rejected', 'hired'] },
        interviews: { $exists: true, $ne: [] },
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
              applicantId: (
                application._id as unknown as Types.ObjectId
              ).toString(),
              applicantName: `${application.firstName} ${application.lastName}`,
              jobTitle: jobTitle,
            });
          }
        }
      }
    }

    // Sort by scheduled date (most recent first)
    return interviews.sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime(),
    );
  }

  /**
   * Get interviews for a specific user (where user is an interviewer)
   */
  async getUserInterviews(userId: string): Promise<InterviewDto[]> {
    const applications = await this.jobApplicationModel
      .find({
        'interviews.interviewers.userId': new Types.ObjectId(userId),
      })
      .populate('jobId')
      .exec();

    const interviews: InterviewDto[] = [];

    // Extract interviews where the user is an interviewer
    for (const application of applications as JobApplicationDocument[]) {
      if (application.interviews && application.interviews.length > 0) {
        const job = application.jobId as any;
        const jobTitle = job ? job.title : 'Unknown Position';

        const userInterviews = application.interviews.filter(
          (interview) =>
            interview.interviewers.some(
              (interviewer) => interviewer.userId.toString() === userId,
            ),
        );

        for (const interview of userInterviews) {
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
              applicantId: (
                application._id as unknown as Types.ObjectId
              ).toString(),
              applicantName: `${application.firstName} ${application.lastName}`,
              jobTitle: jobTitle,
              processId: interview.processId
                ? interview.processId.toString()
                : undefined,
            });
          }
        }
      }
    }

    // Sort by scheduled date (most recent first)
    return interviews.sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime(),
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
        'interviews.scheduledDate': { $gte: today },
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
          (interview) => new Date(interview.scheduledDate) >= today,
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
              applicantId: (
                application._id as unknown as Types.ObjectId
              ).toString(),
              applicantName: `${application.firstName} ${application.lastName}`,
              jobTitle: jobTitle,
            });
          }
        }
      }
    }

    // Sort by scheduled date (soonest first)
    return interviews.sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );
  }

  /**
   * Get interview by ID
   */
  async getInterviewById(interviewId: string, userId?: string): Promise<InterviewDto> {
    let objectId;
    let query: Record<string, any>;

    try {
      // Try to convert to ObjectId if it's a valid format
      objectId = new Types.ObjectId(interviewId);
      query = { 'interviews._id': objectId };
    } catch (_) {
      // If conversion fails, use a different query approach
      console.log(
        `Invalid ObjectId format: ${interviewId}. Using string comparison instead.`,
      );
      query = { interviews: { $elemMatch: { _id: interviewId } } };
    }

    const application = (await this.jobApplicationModel
      .findOne(query)
      .populate('jobId')
      .exec()) as JobApplicationDocument;

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interview = application.interviews.find(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (!interview || !interview._id) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const job = application.jobId as any;
    const jobTitle = job ? job.title : 'Unknown Position';

    const interviewDto: InterviewDto = {
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
      processId: interview.processId
        ? interview.processId.toString()
        : undefined,
      googleEventId: interview.googleEventId,
      onlineMeetingUrl: interview.onlineMeetingUrl,
      meetingId: interview.meetingId,
    };

    // Fetch Google Calendar meeting details if available
    if (interview.googleEventId && userId) {
      try {
        const user = await this.userModel.findById(userId).exec();
        if (user && (user as any).googleAuth) {
          const googleAuth = (user as any).googleAuth;
          
          // Check if Google auth is expired
          if (googleAuth.expiryDate >= Date.now()) {
            const eventDetails = await this.googleCalendarService.getEvent(
              interview.googleEventId,
              {
                accessToken: googleAuth.accessToken,
                refreshToken: googleAuth.refreshToken,
                expiryDate: googleAuth.expiryDate,
              },
            );

            interviewDto.googleMeetingDetails = {
              meetLink: eventDetails.meetLink,
              conferenceId: eventDetails.conferenceId,
              htmlLink: eventDetails.htmlLink,
            };
          }
        }
      } catch (error) {
        console.error('Error fetching Google Calendar event details:', error);
        // Don't fail the request if we can't fetch meeting details
      }
    }

    return interviewDto;
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(
    interviewId: string,
    reason: string,
  ): Promise<InterviewDto> {
    console.log(
      `Attempting to cancel interview with ID: ${interviewId}, reason: ${reason}`,
    );

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
        throw new NotFoundException(
          `Interview with ID ${interviewId} not found`,
        );
      }

      // Find the interview in the application's interviews array
      const interviewIndex = application.interviews.findIndex(
        (i) => i._id && i._id.toString() === interviewId,
      );

      console.log(`Interview index in array: ${interviewIndex}`);

      if (interviewIndex === -1) {
        console.log(
          `Interview with ID ${interviewId} not found in application's interviews array`,
        );
        throw new NotFoundException(
          `Interview with ID ${interviewId} not found`,
        );
      }

      console.log('Before update:', {
        status: application.interviews[interviewIndex].status,
        reason: application.interviews[interviewIndex].cancellationReason,
      });

      // Update the interview status to cancelled
      application.interviews[interviewIndex].status = 'cancelled';
      application.interviews[interviewIndex].cancellationReason = reason;
      application.interviews[interviewIndex].updatedAt = new Date();

      console.log('After update:', {
        status: application.interviews[interviewIndex].status,
        reason: application.interviews[interviewIndex].cancellationReason,
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
  async rescheduleInterview(
    interviewId: string,
    scheduledDate: Date,
    userId?: string,
  ): Promise<InterviewDto> {
    const application = (await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .populate('jobId')
      .exec()) as JobApplicationDocument;

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Check if the interview has already passed
    const currentInterview = application.interviews[interviewIndex];
    const currentDate = new Date();

    if (currentInterview.scheduledDate < currentDate) {
      throw new BadRequestException(
        'Cannot reschedule an interview that has already passed',
      );
    }

    // Check if the new scheduled date is in the past
    if (new Date(scheduledDate) < currentDate) {
      throw new BadRequestException(
        'Cannot reschedule an interview to a past date',
      );
    }

    // Update the interview scheduled date
    application.interviews[interviewIndex].scheduledDate = scheduledDate;
    application.interviews[interviewIndex].updatedAt = new Date();

    await application.save();

    // Update Google Calendar event if it exists
    if (currentInterview.googleEventId && userId) {
      try {
        // Get user's Google tokens
        const user = await this.userModel.findById(userId).exec();
        if (user && (user as any).googleAuth) {
          const googleAuth = (user as any).googleAuth;
          
          // Check if Google auth is expired
          if (googleAuth.expiryDate < Date.now()) {
            throw new BadRequestException('GOOGLE_AUTH_EXPIRED: Your Google Calendar connection has expired. Please reconnect your Google account to update this interview.');
          }
          
          // Get company settings
          const companyDetails = await this.companyService.getCompanyDetails(application.companyId.toString());
          const usesGoogleWorkspace = companyDetails?.settings?.emailCalendarProvider === 'google';
          
          if (usesGoogleWorkspace) {
            // Prepare attendees list
            const attendees = currentInterview.interviewers.map((interviewer) => ({
              email: '', // Email will be fetched from user records
              name: interviewer.name,
            }));

            // Add candidate email
            attendees.push({
              email: application.email,
              name: `${application.firstName} ${application.lastName}`,
            });

            // Fetch interviewer emails
            const interviewerIds = currentInterview.interviewers.map(i => i.userId.toString());
            const interviewerUsers = await this.userModel.find({ _id: { $in: interviewerIds } }).exec();
            
            for (let i = 0; i < attendees.length - 1; i++) {
              const interviewerUser = interviewerUsers.find(u => (u as any)._id.toString() === interviewerIds[i]);
              if (interviewerUser) {
                attendees[i].email = interviewerUser.email;
              }
            }

            // Calculate end date (1 hour after start)
            const endDate = new Date(scheduledDate);
            endDate.setHours(endDate.getHours() + 1);

            // Update Google Calendar event
            await this.googleCalendarService.updateEvent(
              currentInterview.googleEventId,
              {
                title: currentInterview.title,
                description: currentInterview.description || '',
                startDate: scheduledDate,
                endDate: endDate,
                location: currentInterview.location,
                attendees: attendees.filter(a => a.email),
                uid: `interview-${interviewId}@careers-platform`,
              },
              {
                accessToken: googleAuth.accessToken,
                refreshToken: googleAuth.refreshToken,
                expiryDate: googleAuth.expiryDate,
              },
            );
          }
        }
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        // Re-throw if it's an auth expired error
        if (error instanceof BadRequestException && error.message.includes('GOOGLE_AUTH_EXPIRED')) {
          throw error;
        }
        // Don't fail the reschedule for other Google Calendar errors
      }
    }

    // Return the updated interview
    return this.getInterviewById(interviewId);
  }

  /**
   * Update interviewers for an interview
   */
  async updateInterviewers(
    interviewId: string,
    interviewers: { userId: string; name: string }[],
    userId?: string,
  ): Promise<InterviewDto> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Check if the interview has already passed
    const currentInterview = application.interviews[interviewIndex];
    const currentDate = new Date();

    if (currentInterview.scheduledDate < currentDate) {
      throw new BadRequestException(
        'Cannot modify interviewers for an interview that has already passed',
      );
    }

    // Update the interviewers
    application.interviews[interviewIndex].interviewers = interviewers.map(
      (interviewer) => ({
        userId: new Types.ObjectId(interviewer.userId),
        name: interviewer.name,
      }),
    );

    application.interviews[interviewIndex].updatedAt = new Date();

    await application.save();

    // Update Google Calendar event if it exists
    if (currentInterview.googleEventId && userId) {
      try {
        // Get user's Google tokens
        const user = await this.userModel.findById(userId).exec();
        if (user && (user as any).googleAuth) {
          const googleAuth = (user as any).googleAuth;
          
          // Check if Google auth is expired
          if (googleAuth.expiryDate < Date.now()) {
            throw new BadRequestException('GOOGLE_AUTH_EXPIRED: Your Google Calendar connection has expired. Please reconnect your Google account to update this interview.');
          }
          
          // Get company settings
          const companyDetails = await this.companyService.getCompanyDetails(application.companyId.toString());
          const usesGoogleWorkspace = companyDetails?.settings?.emailCalendarProvider === 'google';
          
          if (usesGoogleWorkspace) {
            // Prepare attendees list with new interviewers
            const attendees = interviewers.map((interviewer) => ({
              email: '', // Email will be fetched from user records
              name: interviewer.name,
            }));

            // Add candidate email
            attendees.push({
              email: application.email,
              name: `${application.firstName} ${application.lastName}`,
            });

            // Fetch interviewer emails
            const interviewerIds = interviewers.map(i => i.userId);
            const interviewerUsers = await this.userModel.find({ _id: { $in: interviewerIds } }).exec();
            
            for (let i = 0; i < attendees.length - 1; i++) {
              const interviewerUser = interviewerUsers.find(u => (u as any)._id.toString() === interviewerIds[i]);
              if (interviewerUser) {
                attendees[i].email = interviewerUser.email;
              }
            }

            // Calculate end date (1 hour after start)
            const endDate = new Date(currentInterview.scheduledDate);
            endDate.setHours(endDate.getHours() + 1);

            // Update Google Calendar event
            await this.googleCalendarService.updateEvent(
              currentInterview.googleEventId,
              {
                title: currentInterview.title,
                description: currentInterview.description || '',
                startDate: currentInterview.scheduledDate,
                endDate: endDate,
                location: currentInterview.location,
                attendees: attendees.filter(a => a.email),
                uid: `interview-${interviewId}@careers-platform`,
              },
              {
                accessToken: googleAuth.accessToken,
                refreshToken: googleAuth.refreshToken,
                expiryDate: googleAuth.expiryDate,
              },
            );
          }
        }
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        // Re-throw if it's an auth expired error
        if (error instanceof BadRequestException && error.message.includes('GOOGLE_AUTH_EXPIRED')) {
          throw error;
        }
        // Don't fail the update for other Google Calendar errors
      }
    }

    // Return the updated interview
    return this.getInterviewById(interviewId);
  }

  /**
   * Update interview details (title, description, location)
   */
  async updateInterview(
    interviewId: string,
    updateData: { title?: string; description?: string; location?: string },
    userId?: string,
  ): Promise<InterviewDto> {
    const application = (await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .populate('jobId')
      .exec()) as JobApplicationDocument;

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const currentInterview = application.interviews[interviewIndex];

    // Update the interview details
    if (updateData.title !== undefined) {
      application.interviews[interviewIndex].title = updateData.title;
    }
    if (updateData.description !== undefined) {
      application.interviews[interviewIndex].description = updateData.description;
    }
    if (updateData.location !== undefined) {
      application.interviews[interviewIndex].location = updateData.location;
    }

    application.interviews[interviewIndex].updatedAt = new Date();

    // Mark the interviews array as modified
    application.markModified('interviews');
    await application.save();

    // Update Google Calendar event if it exists
    if (currentInterview.googleEventId && userId) {
      try {
        const user = await this.userModel.findById(userId).exec();
        if (user && (user as any).googleAuth) {
          const googleAuth = (user as any).googleAuth;

          // Check if Google auth is expired
          if (googleAuth.expiryDate < Date.now()) {
            console.warn('Google auth expired, skipping calendar update');
          } else {
            // Get company settings
            const companyDetails = await this.companyService.getCompanyDetails(
              application.companyId.toString(),
            );
            const usesGoogleWorkspace =
              companyDetails?.settings?.emailCalendarProvider === 'google';

            if (usesGoogleWorkspace) {
              // Prepare attendees list
              const attendees = currentInterview.interviewers.map(
                (interviewer) => ({
                  email: '',
                  name: interviewer.name,
                }),
              );

              // Add candidate email
              attendees.push({
                email: application.email,
                name: `${application.firstName} ${application.lastName}`,
              });

              // Fetch interviewer emails
              const interviewerIds = currentInterview.interviewers.map((i) =>
                i.userId.toString(),
              );
              const interviewerUsers = await this.userModel
                .find({ _id: { $in: interviewerIds } })
                .exec();

              for (let i = 0; i < attendees.length - 1; i++) {
                const interviewerUser = interviewerUsers.find(
                  (u) => (u as any)._id.toString() === interviewerIds[i],
                );
                if (interviewerUser) {
                  attendees[i].email = interviewerUser.email;
                }
              }

              // Calculate end date (1 hour after start)
              const endDate = new Date(currentInterview.scheduledDate);
              endDate.setHours(endDate.getHours() + 1);

              // Update Google Calendar event
              await this.googleCalendarService.updateEvent(
                currentInterview.googleEventId,
                {
                  title: application.interviews[interviewIndex].title,
                  description: application.interviews[interviewIndex].description || '',
                  startDate: currentInterview.scheduledDate,
                  endDate: endDate,
                  location: application.interviews[interviewIndex].location,
                  attendees: attendees.filter((a) => a.email),
                  uid: `interview-${interviewId}@careers-platform`,
                },
                {
                  accessToken: googleAuth.accessToken,
                  refreshToken: googleAuth.refreshToken,
                  expiryDate: googleAuth.expiryDate,
                },
              );

              console.log('Google Calendar event updated successfully');
            }
          }
        }
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        if (error.message === 'GOOGLE_AUTH_EXPIRED') {
          throw error;
        }
        // Don't fail the update for other Google Calendar errors
      }
    }

    // Return the updated interview
    return this.getInterviewById(interviewId, userId);
  }

  /**
   * Create Google Meet for an existing interview
   */
  async createGoogleMeetForInterview(
    interviewId: string,
    userId: string,
  ): Promise<InterviewDto> {
    const application = (await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .populate('jobId')
      .exec()) as JobApplicationDocument;

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const currentInterview = application.interviews[interviewIndex];

    // Check if interview already has a Google event
    if (currentInterview.googleEventId) {
      throw new BadRequestException('Interview already has a Google Calendar event');
    }

    // Get user's Google tokens
    const user = await this.userModel.findById(userId).exec();
    if (!user || !(user as any).googleAuth) {
      throw new BadRequestException('User does not have Google Calendar connected');
    }

    const googleAuth = (user as any).googleAuth;

    // Check if Google auth is expired
    if (googleAuth.expiryDate < Date.now()) {
      throw new BadRequestException('GOOGLE_AUTH_EXPIRED: Your Google Calendar connection has expired. Please reconnect your Google account.');
    }

    // Get company settings
    const companyDetails = await this.companyService.getCompanyDetails(application.companyId.toString());
    const usesGoogleWorkspace = companyDetails?.settings?.emailCalendarProvider === 'google';

    if (!usesGoogleWorkspace) {
      throw new BadRequestException('Company does not use Google Workspace');
    }

    // Prepare attendees list
    const attendees = currentInterview.interviewers.map((interviewer) => ({
      email: '', // Email will be fetched from user records
      name: interviewer.name,
    }));

    // Add candidate email
    attendees.push({
      email: application.email,
      name: `${application.firstName} ${application.lastName}`,
    });

    // Fetch interviewer emails
    const interviewerIds = currentInterview.interviewers.map(i => i.userId.toString());
    const interviewerUsers = await this.userModel.find({ _id: { $in: interviewerIds } }).exec();
    
    for (let i = 0; i < attendees.length - 1; i++) {
      const interviewerUser = interviewerUsers.find(u => (u as any)._id.toString() === interviewerIds[i]);
      if (interviewerUser) {
        attendees[i].email = interviewerUser.email;
      }
    }

    // Calculate end date (1 hour after start)
    const endDate = new Date(currentInterview.scheduledDate);
    endDate.setHours(endDate.getHours() + 1);

    // Create Google Calendar event
    const calendarResult = await this.googleCalendarService.createEvent(
      {
        title: currentInterview.title,
        description: currentInterview.description || '',
        startDate: currentInterview.scheduledDate,
        endDate: endDate,
        location: currentInterview.location,
        attendees: attendees.filter(a => a.email),
        uid: `interview-${interviewId}@careers-platform`,
      },
      {
        accessToken: googleAuth.accessToken,
        refreshToken: googleAuth.refreshToken,
        expiryDate: googleAuth.expiryDate,
      },
    );

    // Update interview with Google event details
    application.interviews[interviewIndex].googleEventId = calendarResult.googleEventId;
    application.interviews[interviewIndex].onlineMeetingUrl = calendarResult.googleMeetLink;
    application.interviews[interviewIndex].meetingId = calendarResult.googleConferenceId;
    application.interviews[interviewIndex].updatedAt = new Date();

    // Mark the interviews array as modified so Mongoose saves the changes
    application.markModified('interviews');
    
    await application.save();
    
    console.log('Saved interview with Google Meet details:', {
      googleEventId: calendarResult.googleEventId,
      onlineMeetingUrl: calendarResult.googleMeetLink,
      meetingId: calendarResult.googleConferenceId,
    });

    // Return the updated interview
    return this.getInterviewById(interviewId, userId);
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
      (i) => i._id && i._id.toString() === interviewId,
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
  async getInterviewerFeedback(
    interviewId: string,
    interviewerId: string,
  ): Promise<any> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interview = application.interviews.find(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Find feedback by interviewer ID
    const feedback = interview.feedback?.find(
      (f) => f.interviewerId === interviewerId,
    );

    if (!feedback) {
      throw new NotFoundException(
        `Feedback from interviewer ${interviewerId} not found`,
      );
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
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Initialize feedback array if it doesn't exist
    if (!application.interviews[interviewIndex].feedback) {
      application.interviews[interviewIndex].feedback = [];
    }

    // Check if feedback from this interviewer already exists
    const existingFeedbackIndex = application.interviews[
      interviewIndex
    ].feedback.findIndex((f) => f.interviewerId === feedbackData.interviewerId);

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
      (f) => f.interviewerId === feedbackData.interviewerId,
    );
  }

  /**
   * Update feedback for an interview
   */
  async updateFeedback(
    interviewId: string,
    interviewerId: string,
    feedbackData: any,
  ): Promise<any> {
    const application = await this.jobApplicationModel
      .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
      .exec();

    if (!application) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    const interviewIndex = application.interviews.findIndex(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (interviewIndex === -1) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Check if feedback array exists
    if (!application.interviews[interviewIndex].feedback) {
      throw new NotFoundException(
        `Feedback from interviewer ${interviewerId} not found`,
      );
    }

    // Find feedback by interviewer ID
    const feedbackIndex = application.interviews[
      interviewIndex
    ].feedback.findIndex((f) => f.interviewerId === interviewerId);

    if (feedbackIndex === -1) {
      throw new NotFoundException(
        `Feedback from interviewer ${interviewerId} not found`,
      );
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

  /**
   * Send reminder to interviewer to submit feedback
   */
  async sendFeedbackReminder(
    interviewId: string,
    interviewerId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const application = await this.jobApplicationModel
        .findOne({ 'interviews._id': new Types.ObjectId(interviewId) })
        .exec();

      if (!application) {
        throw new NotFoundException(
          `Interview with ID ${interviewId} not found`,
        );
      }

      const interviewIndex = application.interviews.findIndex(
        (i) => i._id && i._id.toString() === interviewId,
      );

      if (interviewIndex === -1) {
        throw new NotFoundException(
          `Interview with ID ${interviewId} not found`,
        );
      }

      // Check if interviewer exists for this interview
      const interviewer = application.interviews[
        interviewIndex
      ].interviewers.find((i) => i.userId.toString() === interviewerId);

      if (!interviewer) {
        throw new NotFoundException(
          `Interviewer ${interviewerId} not found for this interview`,
        );
      }

      // Check if feedback already exists
      const existingFeedback = application.interviews[
        interviewIndex
      ].feedback?.find((f) => f.interviewerId.toString() === interviewerId);

      if (existingFeedback) {
        return {
          success: false,
          message: 'Feedback has already been submitted by this interviewer',
        };
      }

      // TODO: Implement email sending functionality
      // This would typically involve:
      // 1. Getting the interviewer's email from the users collection
      // 2. Creating an email with a link to submit feedback
      // 3. Sending the email using a mail service

      // For now, we'll just return a success message
      return {
        success: true,
        message: `Reminder sent to interviewer ${interviewerId} for interview ${interviewId}`,
      };
    } catch (error) {
      throw error;
    }
  }
}
