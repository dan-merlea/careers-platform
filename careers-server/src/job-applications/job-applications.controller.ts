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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

// Define a custom Request type with user property
interface RequestWithUser extends Request {
  user: { userId: string; [key: string]: any };
}
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.jobApplicationsService.findOne(id);
  }

  @Get(':id/resume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
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
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.jobApplicationsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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
  async scheduleInterview(
    @Param('id') id: string,
    @Body() scheduleInterviewDto: ScheduleInterviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.jobApplicationsService.scheduleInterview(id, scheduleInterviewDto);
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
