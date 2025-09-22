import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { JobRoleService } from './job-role.service';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobRole } from './job-role.model';
import { LogAction } from 'src/user-logs/user-logs.interceptor';

@Controller('job-roles')
@UseGuards(JwtAuthGuard)
export class JobRoleController {
  constructor(private readonly jobRoleService: JobRoleService) {}

  @Post()
  @LogAction('create_job_role', 'job_role')
  async create(
    @Body() createJobRoleDto: CreateJobRoleDto,
    @Req() req: { user: { companyId: string } }
  ): Promise<JobRole> {
    // Add company ID from authenticated user
    return this.jobRoleService.create({
      ...createJobRoleDto,
      companyId: req.user.companyId
    } as any);
  }

  @Get()
  async findAll(
    @Req() req: { user: { companyId: string } },
    @Query('jobFunctionId') jobFunctionId?: string,
  ): Promise<JobRole[]> {
    // Always filter by company ID
    if (jobFunctionId) {
      return this.jobRoleService.findByJobFunction(jobFunctionId, req.user.companyId);
    }
    return this.jobRoleService.findByCompany(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobRole> {
    return this.jobRoleService.findOne(id);
  }

  @Patch(':id')
  @LogAction('update_job_role', 'job_role')
  async update(
    @Param('id') id: string,
    @Body() updateJobRoleDto: UpdateJobRoleDto,
  ): Promise<JobRole> {
    return this.jobRoleService.update(id, updateJobRoleDto);
  }

  @Delete(':id')
  @LogAction('delete_job_role', 'job_role')
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobRoleService.remove(id);
  }
}
