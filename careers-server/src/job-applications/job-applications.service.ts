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
import {
  JobApplication,
  JobApplicationDocument,
  UserNote,
  Interview,
  Interviewer,
} from './schemas/job-application.schema';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationResponseDto } from './dto/job-application-response.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteDto } from './dto/note.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { InterviewDto } from './dto/get-interview.dto';
import { User } from '../users/schemas/user.schema';
import { GridFsService } from '../gridfs/gridfs.service';

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
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly gridFsService: GridFsService,
    private readonly calendarProviderService: CalendarProviderService,
  ) {}

  async create(
    createJobApplicationDto: CreateJobApplicationDto,
    file: MulterFile,
  ): Promise<JobApplicationResponseDto> {
    // Calculate consent expiration date
    const consentExpiresAt = new Date();
    consentExpiresAt.setMonth(
      consentExpiresAt.getMonth() + createJobApplicationDto.consentDuration,
    );

    // Upload file to GridFS
    const fileId = await this.gridFsService.uploadFile(file, {
      jobId: createJobApplicationDto.jobId,
      applicantEmail: createJobApplicationDto.email,
    });

    // Create new job application
    const newJobApplication = new this.jobApplicationModel({
      ...createJobApplicationDto,
      resumeId: fileId,
      resumeFilename: file.originalname,
      resumeMimeType: file.mimetype,
      consentExpiresAt,
    });

    // Save to database
    const savedApplication = await newJobApplication.save();

    return this.mapToResponseDto(savedApplication);
  }

  async findAll(): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel.find().exec();
    return applications.map((app) => this.mapToResponseDto(app));
  }

  async findByJob(jobId: string): Promise<JobApplicationResponseDto[]> {
    const applications = await this.jobApplicationModel.find({ jobId }).exec();
    return applications.map((app) => this.mapToResponseDto(app));
  }

  async findOne(id: string): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    return this.mapToResponseDto(application);
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
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    application.status = updateStatusDto.status;

    // Automatically enable interviewer visibility when status is 'debrief'
    if (updateStatusDto.status === 'debrief') {
      application.interviewerVisibility = true;
    }

    await application.save();

    return this.mapToResponseDto(application);
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
  ): Promise<InterviewDto> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
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
      onlineMeetingUrl: scheduleInterviewDto.onlineMeetingUrl,
      meetingId: scheduleInterviewDto.meetingId,
      meetingPassword: scheduleInterviewDto.meetingPassword,
    };

    // Add the interview to the application's interviews array
    if (!application.interviews) {
      application.interviews = [];
    }
    application.interviews.push(newInterview);
    await application.save();

    // Return the created interview
    return this.mapInterviewToDto(newInterview);
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

    return this.mapToResponseDto(application);
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
  private mapToResponseDto(
    application: JobApplicationDocument,
  ): JobApplicationResponseDto {
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
        typeof application.jobId === 'object'
          ? application.jobId.toString()
          : application.jobId,
      status: application.status,
      interviewerVisibility: application.interviewerVisibility || false,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
