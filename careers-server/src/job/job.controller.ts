import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { JobService } from './job.service';
import type { JobDocument } from './job.entity';
import type { JobCreateDto, JobResponseDto, JobUpdateDto, JobCreateFromHeadcountDto } from './job.model';
import { JobStatus } from './job.model';
import { AuthGuard } from '@nestjs/passport';

// Define interfaces for populated documents
interface CompanyDocument {
  _id?: { toString(): string };
  name?: string;
  logoUrl?: string;
}

interface DepartmentDocument {
  _id?: { toString(): string };
  title?: string;
}

interface OfficeDocument {
  _id?: { toString(): string };
  name?: string;
  address?: string;
}

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async findAll(
    @Query('company') companyId?: string,
  ): Promise<JobResponseDto[]> {
    let jobs: JobDocument[];
    if (companyId) {
      jobs = await this.jobService.findByCompany(companyId);
    } else {
      jobs = await this.jobService.findAll();
    }
    return jobs.map((job) => this.mapJobToResponseDto(job));
  }

  @Get('for-approval')
  @UseGuards(AuthGuard('jwt'))
  async findJobsForApproval(): Promise<JobResponseDto[]> {
    // Get jobs with PENDING_APPROVAL status
    const jobs = await this.jobService.findByStatus(JobStatus.PENDING_APPROVAL);
    return jobs.map((job) => this.mapJobToResponseDto(job));
  }

  @Get('pending-approval')
  @UseGuards(AuthGuard('jwt'))
  async getPendingApprovalJobs(): Promise<JobResponseDto[]> {
    // Alias for findJobsForApproval to maintain backward compatibility
    return this.findJobsForApproval();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobResponseDto> {
    // Special case for 'for-approval' route is now handled by dedicated endpoint above
    if (id === 'for-approval') {
      throw new NotFoundException('Use /jobs/for-approval endpoint instead');
    }
    const job = await this.jobService.findOne(id);
    return this.mapJobToResponseDto(job);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() jobCreateDto: JobCreateDto | JobCreateFromHeadcountDto,
    @Req() req: { user: { companyId: string } },
  ): Promise<JobResponseDto> {
    // Add company ID from authenticated user
    const jobData = {
      ...jobCreateDto,
      companyId: req.user.companyId,
    };
    
    // Check if this is a job created from a headcount request
    if ('headcountRequestId' in jobData && jobData.headcountRequestId) {
      // Create job with special handling for headcount requests
      const job = await this.jobService.createFromHeadcount(jobData as any);
      return this.mapJobToResponseDto(job);
    } else {
      // Regular job creation
      const job = await this.jobService.create(jobData as any);
      return this.mapJobToResponseDto(job);
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() jobUpdateDto: JobUpdateDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobService.update(id, jobUpdateDto);
    return this.mapJobToResponseDto(job);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobService.remove(id);
  }

  @Get('department/:departmentId')
  async findByDepartment(
    @Param('departmentId') departmentId: string,
  ): Promise<JobResponseDto[]> {
    const jobs = await this.jobService.findByDepartment(departmentId);
    return jobs.map((job) => this.mapJobToResponseDto(job));
  }

  @Get('office/:officeId')
  async findByOffice(
    @Param('officeId') officeId: string,
  ): Promise<JobResponseDto[]> {
    const jobs = await this.jobService.findByOffice(officeId);
    return jobs.map((job) => this.mapJobToResponseDto(job));
  }

  @Get('job-board/:jobBoardId')
  async findByJobBoard(
    @Param('jobBoardId') jobBoardId: string,
  ): Promise<JobResponseDto[]> {
    const jobs = await this.jobService.findByJobBoard(jobBoardId);
    return jobs.map((job) => this.mapJobToResponseDto(job));
  }

  // Endpoint moved to the top of the controller

  @Put(':id/submit-for-approval')
  @UseGuards(AuthGuard('jwt'))
  async submitForApproval(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobService.submitForApproval(id);
    return this.mapJobToResponseDto(job);
  }

  @Put(':id/approve')
  @UseGuards(AuthGuard('jwt'))
  async approveJob(
    @Param('id') id: string,
    @Body('userId') userId: string = 'admin', // Default to 'admin' if not provided
  ): Promise<JobResponseDto> {
    const job = await this.jobService.approveJob(id, userId);
    return this.mapJobToResponseDto(job);
  }

  @Put(':id/reject')
  @UseGuards(AuthGuard('jwt'))
  async rejectJob(
    @Param('id') id: string,
    @Body('userId') userId: string = 'admin', // Default to 'admin' if not provided
    @Body('rejectionReason') rejectionReason: string,
  ): Promise<JobResponseDto> {
    const job = await this.jobService.rejectJob(id, userId, rejectionReason);
    return this.mapJobToResponseDto(job);
  }

  @Put(':id/publish')
  @UseGuards(AuthGuard('jwt'))
  async publishJob(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobService.publishJob(id);
    return this.mapJobToResponseDto(job);
  }

  @Put(':id/archive')
  @UseGuards(AuthGuard('jwt'))
  async archiveJob(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobService.archiveJob(id);
    return this.mapJobToResponseDto(job);
  }

  private mapJobToResponseDto(job: JobDocument): JobResponseDto {
    // Handle populated company document
    const company = job.companyId as CompanyDocument;
    const jobId = job._id as { toString(): string };

    // Handle jobBoardId - convert to string if it exists
    const jobBoardIdStr: string = job.jobBoardId ? job.jobBoardId.toString() : '';

    return {
      id: jobId.toString(),
      internalId: job.internalId,
      title: job.title,
      company: {
        id: company?._id ? company._id.toString() : '',
        name: company?.name || '',
        logoUrl: company?.logoUrl || '',
      },
      location: job.location,
      publishedDate: job.publishedDate,
      updatedAt: job.updatedAt,
      createdAt: job.createdAt,
      content: job.content,
      departments:
        job.departments?.map((dept: DepartmentDocument) => {
          return {
            id: dept._id ? dept._id.toString() : '',
            name: dept.title || '', // Changed from name to title based on department schema
          };
        }) || [],
      offices:
        job.offices?.map((office: OfficeDocument) => {
          return {
            id: office._id ? office._id.toString() : '',
            name: office.name || '',
            location: office.address || '', // Changed from location to address based on office schema
          };
        }) || [],
      status: job.status,
      rejectionReason: job.rejectionReason,
      jobBoardId: jobBoardIdStr,
    };
  }
}
