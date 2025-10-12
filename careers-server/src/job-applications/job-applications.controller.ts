import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  HttpStatus,
  UseGuards,
  Put,
  Req,
  Patch,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogAction } from '../user-logs/user-logs.interceptor';
import { NotifyOn } from '../notifications/notification.interceptor';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

// Define a custom Request type with user property
interface RequestWithUser extends Request {
  user: { userId: string; [key: string]: any };
}
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { UserRole } from '../users/schemas/user.schema';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Helper function to filter file types
const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    'application/pdf', // PDF
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'text/plain', // TXT
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.',
      ),
      false,
    );
  }
};

@Controller('job-applications')
export class JobApplicationsController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
  ) {}

  @Post()
  @LogAction('create_application', 'job_application')
  @NotifyOn('job_application_created')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(), // Use memory storage for GridFS
      fileFilter,
      limits: {
        fileSize: 3 * 1024 * 1024, // 3MB limit
      },
    }),
  )
  async create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    return this.jobApplicationsService.create(createJobApplicationDto, file);
  }

  @Post('referral')
  @UseGuards(JwtAuthGuard)
  @LogAction('create_referral', 'job_application')
  @NotifyOn('job_application_created')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(), // Use memory storage for GridFS
      fileFilter,
      limits: {
        fileSize: 3 * 1024 * 1024, // 3MB limit
      },
    }),
  )
  async createReferral(
    @Body() createReferralDto: CreateReferralDto,
    @UploadedFile() file: MulterFile,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    // Verify that the referee ID matches the current user or the user has admin/recruiter role
    const userId = req.user.userId;
    if (
      createReferralDto.refereeId !== userId &&
      !['admin', 'recruiter'].includes(req.user.role as string)
    ) {
      throw new ForbiddenException(
        'You can only create referrals for yourself',
      );
    }

    return this.jobApplicationsService.createReferral(createReferralDto, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  findAll() {
    return this.jobApplicationsService.findAll();
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  findByJob(@Param('jobId') jobId: string) {
    return this.jobApplicationsService.findByJob(jobId);
  }

  @Get('referrals')
  @UseGuards(JwtAuthGuard)
  findReferralsByUser(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.jobApplicationsService.findReferralsByRefereeId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER, UserRole.USER)
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(id);
  }
  
  /**
   * Get a job application by ID for interviewers
   * This endpoint allows users who are assigned as interviewers to access the job application
   */
  @Get(':id/interviewer-access')
  @UseGuards(JwtAuthGuard)
  async findOneForInterviewer(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.jobApplicationsService.findOneForInterviewer(id, userId);
  }

  @Get(':id/resume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER, UserRole.USER)
  async getResume(@Param('id') id: string, @Res() res: Response) {
    const resume = await this.jobApplicationsService.getResume(id);

    res.setHeader('Content-Type', resume.mimetype);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resume.filename}"`,
    );

    // Pipe the GridFS stream to the response
    resume.stream.pipe(res);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @LogAction('update_application_status', 'job_application')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.jobApplicationsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @LogAction('delete_application', 'job_application')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.jobApplicationsService.remove(id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Delete('cleanup/expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async cleanupExpired(@Res() res: Response) {
    const count =
      await this.jobApplicationsService.cleanupExpiredApplications();
    return res.status(HttpStatus.OK).json({
      message: `Successfully deleted ${count} expired job applications`,
      deletedCount: count,
    });
  }

  /**
   * Get all notes for a job application that belong to the current user
   */
  @Get(':id/notes')
  @UseGuards(JwtAuthGuard)
  async getNotes(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.jobApplicationsService.getNotesByUser(id, userId);
  }

  /**
   * Add a note to a job application
   */
  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  @LogAction('add_note', 'job_application_note')
  async addNote(
    @Param('id') id: string,
    @Body() createNoteDto: CreateNoteDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.jobApplicationsService.addNote(id, createNoteDto, userId);
  }

  /**
   * Update a note
   */
  @Patch(':id/notes/:index')
  @UseGuards(JwtAuthGuard)
  @LogAction('update_note', 'job_application_note')
  async updateNote(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body() updateNoteDto: { content: string },
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.userId;
    return this.jobApplicationsService.updateNote(
      id,
      parseInt(index, 10),
      updateNoteDto.content,
      userId,
    );
  }

  /**
   * Delete a note
   */
  @Delete(':id/notes/:index')
  @UseGuards(JwtAuthGuard)
  @LogAction('delete_note', 'job_application_note')
  async deleteNote(
    @Param('id') id: string,
    @Param('index') index: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    await this.jobApplicationsService.deleteNote(
      id,
      parseInt(index, 10),
      userId,
    );
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Schedule an interview for a job application
   */
  @Post(':id/interviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @LogAction('schedule_interview', 'job_application_interview')
  async scheduleInterview(
    @Param('id') id: string,
    @Body() scheduleInterviewDto: ScheduleInterviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.jobApplicationsService.scheduleInterview(id, scheduleInterviewDto, req.user.userId);
  }

  /**
   * Get all interviews for a job application
   */
  @Get(':id/interviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  async getInterviews(@Param('id') id: string) {
    return this.jobApplicationsService.getInterviews(id);
  }

  /**
   * Update interviewer visibility for a job application
   */
  @Put(':id/interviewer-visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @LogAction('update_interviewer_visibility', 'job_application')
  async updateInterviewerVisibility(
    @Param('id') id: string,
    @Body() updateVisibilityDto: { visibility: boolean },
  ) {
    return this.jobApplicationsService.updateInterviewerVisibility(id, updateVisibilityDto.visibility);
  }

  /**
   * Generate interview invite
   */
  @Get(':id/interviews/:interviewId/invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  async generateInterviewInvite(
    @Param('id') id: string,
    @Param('interviewId') interviewId: string,
    @Res() res: Response,
  ) {
    const invite = await this.jobApplicationsService.generateInterviewInvite(id, interviewId);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="interview_invite.ics"`);
    return res.send(invite);
  }
}
