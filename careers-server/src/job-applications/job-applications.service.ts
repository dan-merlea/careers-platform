import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CalendarProviderService, CalendarEvent } from '../calendar/calendar-provider.service';
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

    try {
      const { stream, file } = await this.gridFsService.getFile(
        application.resumeId,
      );

      return {
        stream,
        filename: application.resumeFilename,
        mimetype: application.resumeMimeType,
      };
    } catch (error) {
      throw new NotFoundException('Resume file not found');
    }
  }

  async remove(id: string): Promise<void> {
    const application = await this.jobApplicationModel.findById(id).exec();

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    // Delete the resume file from GridFS
    try {
      await this.gridFsService.deleteFile(application.resumeId);
    } catch (error) {
      console.error(`Error deleting resume file: ${error.message}`);
    }

    // Delete the application from database
    await this.jobApplicationModel.findByIdAndDelete(id).exec();
  }

  async cleanupExpiredApplications(): Promise<number> {
    const now = new Date();
    const expiredApplications = await this.jobApplicationModel
      .find({ consentExpiresAt: { $lt: now } })
      .exec();

    let deletedCount = 0;

    for (const application of expiredApplications) {
      try {
        // Delete resume file from GridFS
        await this.gridFsService.deleteFile(application.resumeId);

        // Delete application from database
        const appId = application._id?.toString();
        if (appId) {
          await this.jobApplicationModel.findByIdAndDelete(appId).exec();
          deletedCount++;
        }
      } catch (error: any) {
        const appId = application._id?.toString() || 'unknown';
        console.error(
          `Error deleting expired application ${appId}: ${error.message}`,
        );
      }
    }

    return deletedCount;
  }

  /**
   * Update the status of a job application
   * @param id The ID of the job application to update
   * @param updateStatusDto The new status
   * @returns The updated job application
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<JobApplicationResponseDto> {
    const application = await this.jobApplicationModel.findById(id);

    if (!application) {
      throw new NotFoundException(`Job application with ID ${id} not found`);
    }

    application.status = updateStatusDto.status;
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
   * Get all notes for a job application created by a specific user
   * @param applicationId The ID of the job application
   * @param userId The ID of the user
   * @returns Array of notes
   */
  async getNotesByUser(
    applicationId: string,
    userId: string,
  ): Promise<NoteDto[]> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Filter notes by the requesting user
    const userNotes =
      application.userNotes?.filter(
        (note) => note.userId.toString() === userId,
      ) || [];

    // Map to DTOs and return
    return userNotes.map((note) => this.mapToNoteDto(note, applicationId));
  }

  /**
   * Update a note
   * @param applicationId The ID of the job application
   * @param noteIndex The index of the note in the userNotes array
   * @param content The new content
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

    if (!application.userNotes || noteIndex >= application.userNotes.length) {
      throw new NotFoundException(`Note with index ${noteIndex} not found`);
    }

    const note = application.userNotes[noteIndex];

    // Ensure the note belongs to the requesting user
    if (note.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this note',
      );
    }

    // Update the note
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

    // Format the status name for display (capitalize first letter)
    const formatStatusName = (status: string): string => {
      return (
        status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
      );
    };

    // Create a new interview with status name in the title
    const newInterview: Interview = {
      _id: new Types.ObjectId(),
      scheduledDate: scheduleInterviewDto.scheduledDate,
      title: `${formatStatusName(application.status)} - ${scheduleInterviewDto.title}`,
      description: scheduleInterviewDto.description,
      processId: scheduleInterviewDto.processId ? new Types.ObjectId(scheduleInterviewDto.processId) : undefined,
      interviewers: scheduleInterviewDto.interviewers.map((interviewer) => ({
        userId: new Types.ObjectId(interviewer.userId),
        name: interviewer.name,
      })),
      stage: application.status, // Store the current stage with the interview
      status: application.status, // Store the current status with the interview
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add the interview to the application's interviews array
    if (!application.interviews) {
      application.interviews = [];
    }
    application.interviews.push(newInterview);

    // Don't change the application status - keep it in the current stage
    // The interview object stores the status at the time it was created

    await application.save();

    // Return the created interview
    return {
      id: newInterview._id ? newInterview._id.toString() : '',
      scheduledDate: newInterview.scheduledDate,
      title: newInterview.title,
      description: newInterview.description,
      interviewers: newInterview.interviewers.map((interviewer) => ({
        userId: interviewer.userId.toString(),
        name: interviewer.name,
      })),
      stage: newInterview.stage,
      status: newInterview.status,
      createdAt: newInterview.createdAt,
      updatedAt: newInterview.updatedAt,
      processId: newInterview.processId ? newInterview.processId.toString() : undefined,
    };
  }

  /**
   * Get all interviews for a job application
   */
  async getInterviews(applicationId: string): Promise<InterviewDto[]> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    if (!application.interviews || application.interviews.length === 0) {
      return [];
    }

    // Map the interviews to DTOs
    return application.interviews.map((interview) => ({
      id: interview._id ? interview._id.toString() : '',
      scheduledDate: interview.scheduledDate,
      title: interview.title,
      description: interview.description,
      interviewers: interview.interviewers.map((interviewer) => ({
        userId: interviewer.userId.toString(),
        name: interviewer.name,
      })),
      stage: interview.stage || application.status, // Use the stored stage or fallback to current status
      status: interview.status || application.status, // Use the stored status or fallback to current status
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      processId: interview.processId ? interview.processId.toString() : undefined,
    }));
  }

  /**
   * Get emails for interviewers based on their user IDs
   */
  private async getInterviewerEmails(
    interviewers: Interviewer[],
  ): Promise<Array<{ name: string; email: string }>> {
    if (!interviewers || interviewers.length === 0) {
      return [];
    }

    const userIds = interviewers.map((interviewer) => interviewer.userId);
    const users = await this.userModel.find({ _id: { $in: userIds } }).exec();

    // Map user IDs to emails
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
   * Generate an interview invite based on the company's email/calendar provider
   */
  async generateInterviewInvite(
    applicationId: string,
    interviewId: string,
  ): Promise<string> {
    const application = await this.jobApplicationModel.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Job application with ID ${applicationId} not found`,
      );
    }

    // Find the interview
    const interview = application.interviews?.find(
      (i) => i._id && i._id.toString() === interviewId,
    );

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${interviewId} not found`);
    }

    // Generate a unique identifier for the event
    const uid = `${interviewId}@careers-platform`;

    // Format the start date
    const startDate = interview.scheduledDate;

    // Format the end date (1 hour after start)
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    // Get interviewers' emails if available
    const interviewerEmails = await this.getInterviewerEmails(
      interview.interviewers,
    );

    // Create the description with interviewers' information
    let description =
      interview.description ||
      `Interview for ${application.firstName} ${application.lastName}`;
    description += `\n\nCandidate Email: ${application.email}`;

    // Add interviewers' emails to the description
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

    // Define the attendee type to match CalendarEvent interface
    type CalendarAttendee = {
      name: string;
      email: string;
      role?: 'CHAIR' | 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT';
    };
    
    // Format attendees for the calendar provider service
    const attendees: CalendarAttendee[] = [
      {
        name: `${application.firstName} ${application.lastName}`,
        email: application.email,
        role: 'REQ-PARTICIPANT',
      },
      ...interviewerEmails
        .filter((attendee) => attendee.email)
        .map((attendee): CalendarAttendee => ({
          name: attendee.name,
          email: attendee.email,
          role: 'REQ-PARTICIPANT',
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
    };

    // Use the calendar provider service to generate the invite
    const inviteResult = await this.calendarProviderService.generateInvite(calendarEvent);
    
    return inviteResult.content;
  }

  /**
   * Map a UserNote to a NoteDto
   * @param note The UserNote to map
   * @param applicationId The ID of the job application
   * @returns The mapped NoteDto
   */
  private mapToNoteDto(note: UserNote, applicationId: string): NoteDto {
    return {
      id: note._id?.toString(),
      userId: note.userId.toString(),
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

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
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    };
  }
}
