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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JobApplicationsService } from './job-applications.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
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
}
