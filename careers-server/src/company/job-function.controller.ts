import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JobFunctionService } from './job-function.service';
import { CreateJobFunctionDto } from './dto/create-job-function.dto';
import { UpdateJobFunctionDto } from './dto/update-job-function.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobFunction } from './job-function.model';
import { LogAction } from 'src/user-logs/user-logs.interceptor';

@Controller('job-functions')
@UseGuards(JwtAuthGuard)
export class JobFunctionController {
  constructor(private readonly jobFunctionService: JobFunctionService) {}

  @Post()
  @LogAction('create_job_function', 'job_function')
  async create(
    @Body() createJobFunctionDto: CreateJobFunctionDto,
    @Req() req: { user: { companyId: string } },
  ): Promise<JobFunction> {
    // Add company ID from authenticated user
    return this.jobFunctionService.create({
      ...createJobFunctionDto,
      companyId: req.user.companyId
    } as any);
  }

  @Get()
  async findAll(
    @Req() req: { user: { companyId: string } },
  ): Promise<JobFunction[]> {
    // Always filter by the authenticated user's company
    return this.jobFunctionService.findByCompany(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobFunction> {
    return this.jobFunctionService.findOne(id);
  }

  @Patch(':id')
  @LogAction('update_job_function', 'job_function')
  async update(
    @Param('id') id: string,
    @Body() updateJobFunctionDto: UpdateJobFunctionDto,
  ): Promise<JobFunction> {
    return this.jobFunctionService.update(id, updateJobFunctionDto);
  }

  @Delete(':id')
  @LogAction('delete_job_function', 'job_function')
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobFunctionService.remove(id);
  }
}
