import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JobApplicationsService } from '../job-applications/job-applications.service';
import { CompanyService } from '../company/company.service';
import { JobBoardsService } from '../job-boards/job-boards.service';
import { JobService } from '../job/job.service';
import { CreateJobApplicationDto } from '../job-applications/dto/create-job-application.dto';
import { LogAction } from 'src/user-logs/user-logs.interceptor';
import { NotifyOn } from 'src/notifications/notification.interceptor';

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

@Controller('public-api')
@UseGuards(ThrottlerGuard)
export class PublicApiController {
  constructor(
    private readonly jobApplicationsService: JobApplicationsService,
    private readonly companyService: CompanyService,
    private readonly jobBoardsService: JobBoardsService,
    private readonly jobService: JobService,
  ) {}

  // ==================== Company Endpoints ====================

  @Get('company/:companyId')
  async getCompanyInfo(@Param('companyId') companyId: string) {
    try {
      const company = await this.companyService.getCompanyDetails(companyId);
      // Return only public information
      return {
        companyName: company.name,
        logo: company.logo,
        slogan: company.slogan,
        primaryColor: company.primaryColor || '#3B82F6',
        secondaryColor: company.secondaryColor || '#8B5CF6',
      };
    } catch {
      return { statusCode: 404, message: 'Company not found' };
    }
  }

  // ==================== Job Board Endpoints ====================

  @Get('job-boards/slug/:slug')
  async getJobBoardBySlug(@Param('slug') slug: string) {
    return this.jobBoardsService.findBySlug(slug);
  }

  @Get('job-boards/domain/:domain')
  async getJobBoardByCustomDomain(@Param('domain') domain: string) {
    return this.jobBoardsService.findByCustomDomain(domain);
  }

  @Get('job-boards/:jobBoardId')
  async getJobBoard(@Param('jobBoardId') jobBoardId: string) {
    const jobBoard = await this.jobBoardsService.findBySlug(jobBoardId);
    return jobBoard;
  }

  // ==================== Job Endpoints ====================

  @Get('jobs/job-board/:jobBoardId')
  async getJobsByJobBoard(@Param('jobBoardId') jobBoardId: string) {
    return this.jobService.findByJobBoard(jobBoardId);
  }

  @Get('jobs/:jobId')
  async getJob(@Param('jobId') jobId: string) {
    return this.jobService.findOne(jobId);
  }

  // ==================== Job Application Endpoints ====================

  @Post('job-applications')
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 1 request per second
  @LogAction('create_application', 'job_application')
  @NotifyOn('job_application_created')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      fileFilter: JobApplicationsService.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async createJobApplication(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.jobApplicationsService.create(createJobApplicationDto, file);
  }
}
