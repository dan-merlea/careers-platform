import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CalendarProviderService,
  CalendarEvent,
} from '../calendar/calendar-provider.service';
import { GoogleCalendarService } from '../calendar/google-calendar.service';
import { CompanyService } from '../company/company.service';
import {
  JobApplication,
  JobApplicationDocument,
  UserNote,
  Interview,
  Interviewer,
} from './schemas/job-application.schema';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import {
  InterviewStageDto,
  JobApplicationResponseDto,
} from './dto/job-application-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteDto } from './dto/note.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { InterviewDto } from './dto/get-interview.dto';
import { User } from '../users/schemas/user.schema';
import { GridFsService } from '../gridfs/gridfs.service';
import { NotificationGeneratorService } from '../notifications/notification-generator.service';
import { Job, JobDocument } from '../job/job.entity';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectModel(JobApplication.name)
    private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly gridFsService: GridFsService,
    private readonly calendarProviderService: CalendarProviderService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly companyService: CompanyService,
    private readonly notificationGeneratorService: NotificationGeneratorService,
  ) {}

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    file?: MulterFile,
  ): Promise<JobApplicationResponseDto> {
    // Fetch the job to get the companyId
    const job = await this.jobModel.findById(createJobApplicationDto.jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Calculate consent expiration date (default to 12 months if not provided)
    const consentExpiresAt = new Date();
    const consentDuration = createJobApplicationDto.consentDuration || 12;
    consentExpiresAt.setMonth(consentExpiresAt.getMonth() + consentDuration);

    let fileId: string | null = null;
    let resumeFilename: string | null = null;
    let resumeMimeType: string | null = null;

    // Upload file to GridFS if provided
    if (file) {
      fileId = await this.gridFsService.uploadFile(file, {
        jobId: createJobApplicationDto.jobId,
        applicantEmail: createJobApplicationDto.email,
      });
      resumeFilename = file.originalname;
      resumeMimeType = file.mimetype;
    } else if (createJobApplicationDto.resumePath) {
      // For public applications from career site, store file path reference
      resumeFilename = createJobApplicationDto.resumeFilename || createJobApplicationDto.resumeOriginalName || null;
      resumeMimeType = 'application/pdf'; // Default, will be updated if needed
    }

    // Create new job application
    const newJobApplication = new this.jobApplicationModel({
      ...createJobApplicationDto,
      resumeId: fileId,
      resumeFilename,
      resumeMimeType,
      consentExpiresAt,
      companyId: job.companyId,
      status: 'new', // Automatically set status to 'new'
      source: createJobApplicationDto.source || 'career_site',
    });

    // Save to database
    const savedApplication = await newJobApplication.save();

    return await this.mapToResponseDto(savedApplication);
  }

  /**
   * Create a job application as a referral
   * @param createReferralDto The referral data
   * @param file The resume file
   * @returns The created job application
   */
  async createReferral(
    createReferralDto: CreateReferralDto,
    file: MulterFile,
  ): Promise<JobApplicationResponseDto> {
    // Calculate consent expiration date
    const consentExpiresAt = new Date();
    consentExpiresAt.setMonth(
      consentExpiresAt.getMonth() + createReferralDto.consentDuration,
    );

    // Upload file to GridFS
    const fileId = await this.gridFsService.uploadFile(file, {
      jobId: createReferralDto.jobId,
      applicantEmail: createReferralDto.email,
    });

    // Get referee user information
    const referee = await this.userModel
      .findById(createReferralDto.refereeId)
      .exec();
    if (!referee) {
      throw new NotFoundException(
        `User with ID ${createReferralDto.refereeId} not found`,
      );
    }

    // Create new job application
    const newJobApplication = new this.jobApplicationModel({
      ...createReferralDto,
      resumeId: fileId,
      resumeFilename: file.originalname,
      resumeMimeType: file.mimetype,
      consentExpiresAt,
      status: 'new', // Automatically set status to 'new'
      isReferral: true,
      source: createReferralDto.source || 'referral', // Use provided source or default to 'referral'
      refereeId: new Types.ObjectId(createReferralDto.refereeId),
      refereeName: referee.name,
      refereeEmail: referee.email,
      refereeRelationship: createReferralDto.refereeRelationship,
    });

    // Save to database
    const savedApplication = await newJobApplication.save();

    return await this.mapToResponseDto(savedApplication);
  }

  async findAll(): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel
      .find()
      .populate('jobId', 'title')
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();
    return await Promise.all(
      applications.map((app) => this.mapToResponseDto(app)),
    );
  }

  async findByJob(jobId: string): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel
      .find({ jobId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();
    return await Promise.all(
      applications.map((app) => this.mapToResponseDto(app)),
    );
  }

  /**
   * Find all referrals made by a specific user
   * @param refereeId The ID of the referee user
   * @returns Array of job applications that were referred by the user
   */
  async findReferralsByRefereeId(
    refereeId: string,
  ): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel
      .find({
        refereeId: new Types.ObjectId(refereeId),
        isReferral: true,
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();

    return await Promise.all(
      applications.map((app) => this.mapToResponseDto(app)),
    );
  }

  async findOne(id: string): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    return await this.mapToResponseDto(application);
  }

  /**
   * Find a job application by ID for an interviewer
   * This method checks if the user is assigned as an interviewer for any interview in the job application
   */
  async findOneForInterviewer(
    id: string,
    userId: string,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    // Check if the user is an interviewer for any interview in this application
    const isInterviewer = application.interviews.some((interview) =>
      interview.interviewers.some(
        (interviewer) => interviewer.userId.toString() === userId,
      ),
    );

    if (!isInterviewer) {
      throw new ForbiddenException(
        'You do not have permission to access this job application',
      );
    }

    return await this.mapToResponseDto(application);
  }

  async getResume(id: string): Promise<{
    stream: any;
    filename: string;
    mimetype: string;
  }> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    if (!application.resumeId) {
      throw new NotFoundException(
        `No resume found for application with ID ${id}`,
      );
    }

    try {
      // Use the getFile method from GridFsService
      const { stream, file } = await this.gridFsService.getFile(
        application.resumeId,
      );

      return {
        stream,
        filename: application.resumeFilename || 'resume.pdf',
        mimetype: application.resumeMimeType || 'application/pdf',
      };
    } catch {
      throw new NotFoundException(
        `Resume file not found for application with ID ${id}`,
      );
    }
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel
      .findById(id)
      .populate('jobId')
      .exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    application.status = updateStatusDto.status;

    // Automatically enable interviewer visibility when status is 'debrief'
    if (updateStatusDto.status === 'debrief') {
      application.interviewerVisibility = true;
    }

    // Calculate and update progress based on the new status
    // Extract the actual ID if jobId is populated
    const jobId = typeof application.jobId === 'object' && application.jobId !== null
      ? (application.jobId as any)._id
      : application.jobId;
    
    const progress = await this.calculateProgress(
      jobId,
      updateStatusDto.status,
    );
    application.progress = progress;

    await application.save();

    return await this.mapToResponseDto(application);
  }

  /**
   * Calculate application progress percentage based on current stage
   * @param jobId The job ID to get interview process stages
   * @param status The current application status/stage
   * @returns Progress percentage (0-100)
   */
  private async calculateProgress(jobId: any, status: string): Promise<number> {
    try {
      // Define standard stages with their order
      const standardStages = [
        { id: 'new', order: -2 },
        { id: 'reviewed', order: -1 },
      ];

      const finalStages = [
        { id: 'debrief', order: 1000 },
        { id: 'offered', order: 1001 },
        { id: 'hired', order: 1002 },
      ];

      let customStages: any[] = [{ id: 'interviewing', order: 0 }];

      // Get the job to find its interview process
      const job = await this.jobApplicationModel.db
        .collection('jobs')
        .findOne({ _id: jobId });

      if (job && job.roleId) {
        // Get the interview process based on roleId
        const interviewProcess = await this.jobApplicationModel.db
          .collection('interviewprocesses')
          .findOne({ jobRoleId: job.roleId });

        if (
          interviewProcess &&
          interviewProcess.stages &&
          interviewProcess.stages.length > 0
        ) {
          // Map custom stages with adjusted order (starting after 'reviewed')
          customStages = interviewProcess.stages.map(
            (stage: any, index: number) => ({
              id: stage._id.toString(), // Use MongoDB _id to match the status field
              order: 2 + index, // Start custom stages after 'new' and 'reviewed'
            }),
          );
        }
      }

      // Combine all stages: standard -> custom -> final
      const allStages = [...standardStages, ...customStages, ...finalStages];

      // Sort all stages by order
      const sortedStages = allStages.sort((a, b) => a.order - b.order);

      // Find the current stage index
      const currentStageIndex = sortedStages.findIndex(
        (stage) => stage.id === status || stage.id === `stage-${status}`,
      );

      if (currentStageIndex === -1) {
        return 0;
      }

      // Calculate progress percentage
      const progress = Math.round(
        (currentStageIndex / (sortedStages.length - 1)) * 100,
      );
      return progress;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  }

  /**
   * Add a note to a job application
   * @param applicationId The ID of the job application
   * @param createNoteDto The note content
   * @param userId The ID of the user creating the note
   * @returns The created note
   */
  async addNote(
    applicationId: string,
    createNoteDto: CreateNoteDto,
    userId: string,
  ): Promise<NoteDto> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Create a new note
    const newNote: UserNote = {
      userId: new Types.ObjectId(userId),
      content: createNoteDto.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add the note to the application's userNotes array
    if (!application.userNotes) {
      application.userNotes = [];
    }
    application.userNotes.push(newNote);
    await application.save();

    // Return the created note
    return this.mapToNoteDto(
      newNote,
      application.id || application._id?.toString() || '',
    );
  }

  /**
   * Get all notes for a job application
   * @param applicationId The ID of the job application
   * @returns Array of notes
   */
  async getNotes(applicationId: string): Promise<NoteDto[]> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    const userNotes = application.userNotes || [];
    return userNotes.map((note) => this.mapToNoteDto(note, applicationId));
  }

  /**
   * Update a note
   * @param applicationId The ID of the job application
   * @param noteIndex The index of the note in the userNotes array
   * @param content The new content for the note
   * @param userId The ID of the user updating the note
   * @returns The updated note
   */
  async updateNote(
    applicationId: string,
    noteIndex: number,
    content: string,
    userId: string,
  ): Promise<NoteDto> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Check if the note exists and belongs to the user
    if (
      !application.userNotes ||
      !application.userNotes[noteIndex] ||
      application.userNotes[noteIndex].userId.toString() !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this note',
      );
    }

    // Update the note
    const note = application.userNotes[noteIndex];
    note.content = content;
    note.updatedAt = new Date();
    await application.save();

    // Return the updated note
    return this.mapToNoteDto(note, applicationId);
  }

  /**
   * Delete a note
   * @param applicationId The ID of the job application
   * @param noteIndex The index of the note in the userNotes array
   * @param userId The ID of the user deleting the note
   */
  async deleteNote(
    applicationId: string,
    index: number,
    userId: string,
  ): Promise<void> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Check if the note exists and belongs to the user
    if (
      !application.userNotes ||
      !application.userNotes[index] ||
      application.userNotes[index].userId.toString() !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this note',
      );
    }

    // Remove the note at the specified index
    application.userNotes.splice(index, 1);
    await application.save();
  }

  /**
   * Schedule an interview for a job application
   */
  async scheduleInterview(
    applicationId: string,
    scheduleInterviewDto: ScheduleInterviewDto,
    userId: string,
  ): Promise<InterviewDto> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Check if company uses Google Workspace
    const company = await this.companyService.getCompanyDetails(application.companyId.toString());
    const useGoogleWorkspace = company.settings?.emailCalendarProvider === 'google';
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    let googleEventId: string | undefined;
    let googleMeetLink: string | undefined;
    let googleConferenceId: string | undefined;
    let onlineMeetingUrl = scheduleInterviewDto.onlineMeetingUrl;
    let meetingId = scheduleInterviewDto.meetingId;

    // If using Google Workspace and no manual meeting details provided, create Google Meet
    if (useGoogleWorkspace && user.googleAuth) {
      try {
        // Get interviewer emails
        const interviewerEmails = await this.getInterviewerEmails(
          scheduleInterviewDto.interviewers.map((i) => ({
            userId: new Types.ObjectId(i.userId),
            name: i.name,
          })),
        );

        // Create calendar event
        const startDate = new Date(scheduleInterviewDto.scheduledDate);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        const uid = `interview-${Date.now()}@careers-platform`;
        
        const attendees = [
          {
            name: `${application.firstName} ${application.lastName}`,
            email: application.email,
            role: 'REQ-PARTICIPANT' as const,
          },
          ...interviewerEmails.map((interviewer) => ({
            name: interviewer.name,
            email: interviewer.email,
            role: 'REQ-PARTICIPANT' as const,
          })),
        ];

        const calendarEvent: CalendarEvent = {
          uid,
          title: `Interview: ${scheduleInterviewDto.title}`,
          description: scheduleInterviewDto.description || `Interview for ${application.firstName} ${application.lastName}`,
          startDate,
          endDate,
          attendees,
          location: scheduleInterviewDto.location,
        };

        // Create Google Calendar event with Meet link
        const result = await this.googleCalendarService.createEvent(calendarEvent, user.googleAuth);
        
        googleEventId = result.googleEventId;
        googleMeetLink = result.googleMeetLink;
        googleConferenceId = result.googleConferenceId;
        onlineMeetingUrl = result.googleMeetLink;
        meetingId = result.googleConferenceId;
      } catch (error) {
        console.error('Failed to create Google Meet link:', error);
        
        // If Google auth expired, clear the user's tokens and throw a specific error
        if (error.message === 'GOOGLE_AUTH_EXPIRED' && userId) {
          await this.userModel.findByIdAndUpdate(userId, {
            $unset: { googleAuth: 1 }
          });
          throw new Error('GOOGLE_AUTH_EXPIRED: Your Google Calendar connection has expired. Please reconnect your Google account.');
        }
      }
    }

    // Create a new interview
    const newInterview: Interview = {
      scheduledDate: scheduleInterviewDto.scheduledDate,
      title: scheduleInterviewDto.title,
      description: scheduleInterviewDto.description,
      interviewers: scheduleInterviewDto.interviewers.map((interviewer) => ({
        userId: new Types.ObjectId(interviewer.userId),
        name: interviewer.name,
      })),
      stage: scheduleInterviewDto.stage,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      processId: scheduleInterviewDto.processId
        ? new Types.ObjectId(scheduleInterviewDto.processId)
        : undefined,
      location: scheduleInterviewDto.location,
      onlineMeetingUrl,
      meetingId,
      meetingPassword: scheduleInterviewDto.meetingPassword,
      googleEventId,
      googleMeetLink,
      googleConferenceId,
    };

    console.log(newInterview);

    // Add the interview to the application's interviews array
    if (!application.interviews) {
      application.interviews = [];
    }
    application.interviews.push(newInterview);
    const savedApplication = await application.save();

    // Get the newly created interview with its generated _id
    const createdInterview = savedApplication.interviews[savedApplication.interviews.length - 1];
    
    if (!createdInterview._id) {
      throw new Error('Failed to create interview: ID not generated');
    }

    // Return the created interview
    return this.mapInterviewToDto(createdInterview);
  }

  /**
   * Get all interviews for a job application
   */
  async getInterviews(id: string): Promise<InterviewDto[]> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    return (
      application.interviews?.map((interview) =>
        this.mapInterviewToDto(interview),
      ) || []
    );
  }

  /**
   * Generate an interview invite for a specific interview
   */
  async generateInterviewInvite(
    applicationId: string,
    interviewId: string,
  ): Promise<string> {
    const application = await this.jobApplicationModel
      .findById(applicationId)
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    const interview = application.interviews?.find(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Create a consistent UID that will remain the same for this interview
    // Format: interview-{interviewId}@careers-platform
    // This ensures that calendar clients recognize this as the same event when re-downloaded
    const uid = `interview-${interviewId}@careers-platform`;

    // Get the scheduled date from the interview
    const startDate = interview.scheduledDate;

    // Create an end date 1 hour after the start date
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    // Get emails of all interviewers
    const interviewerEmails = await this.getInterviewerEmails(
      interview.interviewers,
    );

    // Create description for the invite
    let description =
      interview.description ||
      `Interview for ${application.firstName} ${application.lastName}`;
    description += `\n\nCandidate Email: ${application.email}`;

    // Add interviewer information to the description
    if (interviewerEmails.length > 0) {
      description += '\n\nInterviewers:';
      interviewerEmails.forEach(({ name, email }) => {
        if (email) {
          description += `\n- ${name} (${email})`;
        } else {
          description += `\n- ${name}`;
        }
      });
    }

    // Create attendees list
    const attendees = [
      {
        name: `${application.firstName} ${application.lastName}`,
        email: application.email,
        role: 'REQ-PARTICIPANT' as const,
      },
      ...interviewerEmails.map((interviewer) => ({
        name: interviewer.name,
        email: interviewer.email,
        role: 'REQ-PARTICIPANT' as const,
      })),
    ];

    // Create calendar event object
    const calendarEvent: CalendarEvent = {
      uid,
      title: `Interview: ${interview.title}`,
      description,
      startDate,
      endDate,
      attendees,
      location: interview.location,
      onlineMeetingUrl: interview.onlineMeetingUrl,
      meetingId: interview.meetingId,
      meetingPassword: interview.meetingPassword,
    };

    // Use the calendar provider service to generate the invite
    const inviteResult =
      await this.calendarProviderService.generateInvite(calendarEvent);

    return inviteResult.content;
  }

  /**
   * Update interviewer visibility for a job application
   */
  async updateInterviewerVisibility(
    id: string,
    visibility: boolean,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    // Update the interviewer visibility
    application.interviewerVisibility = visibility;
    await application.save();

    return await this.mapToResponseDto(application);
  }

  /**
   * Remove a job application by ID
   * @param id The ID of the job application to remove
   */
  async remove(id: string): Promise<void> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    // Delete resume file if it exists
    if (application.resumeId) {
      try {
        await this.gridFsService.deleteFile(application.resumeId);
      } catch (error) {
        console.error(`Error deleting resume file: ${error.message}`);
      }
    }

    // Delete the application
    await this.jobApplicationModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get notes by user ID for a specific application
   * @param applicationId The ID of the job application
   * @param userId The ID of the user
   * @returns Array of notes created by the user for the application
   */
  async getNotesByUser(
    applicationId: string,
    userId: string,
  ): Promise<NoteDto[]> {
    const application = await this.jobApplicationModel
      .findById(applicationId)
      .exec();

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Filter notes by user ID
    const userNotes =
      application.userNotes?.filter(
        (note) => note.userId.toString() === userId,
      ) || [];

    return userNotes.map((note) => this.mapToNoteDto(note, applicationId));
  }

  /**
   * Alias for deleteExpiredApplications
   * @returns Number of deleted applications
   */
  async cleanupExpiredApplications(): Promise<number> {
    return this.deleteExpiredApplications();
  }

  /**
   * Delete expired applications
   * @returns Number of deleted applications
   */
  async deleteExpiredApplications(): Promise<number> {
    const now = new Date();
    const expiredApplications = await this.jobApplicationModel.find({
      consentExpiresAt: { $lt: now },
    });

    let deletedCount = 0;

    for (const application of expiredApplications) {
      const appId = application._id.toString();

      try {
        // Delete resume file if it exists
        if (application.resumeId) {
          await this.gridFsService.deleteFile(application.resumeId);
        }

        // Delete the application
        await this.jobApplicationModel.findByIdAndDelete(appId);
        deletedCount++;
      } catch (error) {
        console.error(
          `Error deleting expired application ${appId}: ${error.message}`,
        );
      }
    }

    return deletedCount;
  }

  /**
   * Map a UserNote to a NoteDto
   */
  private mapToNoteDto(note: UserNote, applicationId: string): NoteDto {
    return {
      id: note._id?.toString(),
      applicantionId: applicationId,
      userId: note.userId.toString(),
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  /**
   * Map an Interview to an InterviewDto
   */
  private mapInterviewToDto(interview: Interview): InterviewDto {
    return {
      id: interview._id ? interview._id.toString() : '',
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
      processId: interview.processId
        ? interview.processId.toString()
        : undefined,
    };
  }

  /**
   * Get emails of interviewers
   */
  private async getInterviewerEmails(
    interviewers: Interviewer[],
  ): Promise<Array<{ name: string; email: string }>> {
    if (!interviewers || interviewers.length === 0) {
      return [];
    }

    // Get user IDs from interviewers
    const userIds = interviewers.map((interviewer) => interviewer.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } }).exec();

    // Map interviewers to their emails
    return interviewers.map((interviewer) => {
      const user = users.find(
        (u) => u._id.toString() === interviewer.userId.toString(),
      );
      return {
        name: interviewer.name,
        email: user?.email || '',
      };
    });
  }

  /**
   * Map a JobApplicationDocument to a JobApplicationResponseDto
   */
  private async mapToResponseDto(
    application: JobApplicationDocument,
  ): Promise<JobApplicationResponseDto> {
    // Build stages list
    // Extract the actual ID if jobId is populated
    const jobId = typeof application.jobId === 'object' && application.jobId !== null
      ? (application.jobId as any)._id
      : application.jobId;
    
    const stages = await this.buildStagesForApplication(jobId);

    return {
      id: application._id?.toString() || '',
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      linkedin: application.linkedin,
      website: application.website,
      resumeFilename: application.resumeFilename,
      consentDuration: application.consentDuration,
      consentExpiresAt: application.consentExpiresAt,
      jobId:
        typeof application.jobId === 'object' && application.jobId !== null && 'title' in application.jobId
          ? { _id: (application.jobId as any)._id.toString(), title: (application.jobId as any).title || 'Unknown Position' }
          : typeof application.jobId === 'object'
          ? application.jobId.toString()
          : application.jobId,
      status: application.status,
      progress: application.progress,
      stages,
      interviewerVisibility: application.interviewerVisibility || false,
      refereeId: application.refereeId?.toString(),
      refereeName: application.refereeName,
      refereeEmail: application.refereeEmail,
      refereeRelationship: application.refereeRelationship,
      isReferral: application.isReferral || false,
      source: application.source || 'careers-page',
      availableTimeSlots: application.availableTimeSlots,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }

  /**
   * Build complete stages list for an application
   * Includes: standard initial stages -> custom interview process stages -> standard final stages
   */
  private async buildStagesForApplication(jobId: any): Promise<any[]> {
    try {
      // Get the job to find its interview process
      const job = await this.jobApplicationModel.db
        .collection('jobs')
        .findOne({ _id: jobId });

      let processId = '';
      let customStages: InterviewStageDto[] = [
        {
          id: 'interviewing',
          title: 'Interviewing',
          order: 0,
          processId: processId,
          color: 'bg-indigo-500',
        },
      ];

      if (job && job.roleId) {
        // Get the interview process based on roleId
        const interviewProcess = await this.jobApplicationModel.db
          .collection('interviewprocesses')
          .findOne({ jobRoleId: job.roleId });

        if (
          interviewProcess &&
          interviewProcess.stages &&
          interviewProcess.stages.length > 0
        ) {
          processId = interviewProcess._id.toString();
          customStages = interviewProcess.stages.map(
            (stage: any, index: number) => ({
              id: stage._id.toString(),
              title: stage.title,
              order: stage.order || index,
              processId,
              emailTemplate: stage.emailTemplate,
              color: 'bg-indigo-500',
            }),
          );
        }
      }

      // Standard initial stages
      const standardInitialStages = [
        { id: 'new', title: 'New', order: -2, processId, color: 'bg-blue-500' },
        {
          id: 'reviewed',
          title: 'Reviewed',
          order: -1,
          processId,
          color: 'bg-blue-500',
        },
      ];

      // Standard final stages
      const standardFinalStages = [
        {
          id: 'debrief',
          title: 'Debrief',
          order: 996,
          processId,
          color: 'bg-pink-500',
        },
        {
          id: 'offered',
          title: 'Offered',
          order: 997,
          processId,
          color: 'bg-orange-500',
        },
        {
          id: 'hired',
          title: 'Hired',
          order: 998,
          processId,
          color: 'bg-green-500',
        },
        {
          id: 'rejected',
          title: 'Rejected',
          order: 999,
          processId,
          color: 'bg-red-500',
        },
      ];

      // Combine all stages
      return [
        ...standardInitialStages,
        ...customStages,
        ...standardFinalStages,
      ];
    } catch (error) {
      console.error('Error building stages for application:', error);
      return [];
    }
  }
}
