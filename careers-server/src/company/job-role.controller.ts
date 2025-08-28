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
} from '@nestjs/common';
import { JobRoleService } from './job-role.service';
import { CreateJobRoleDto } from './dto/create-job-role.dto';
import { UpdateJobRoleDto } from './dto/update-job-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobRole } from './job-role.model';

@Controller('job-roles')
@UseGuards(JwtAuthGuard)
export class JobRoleController {
  constructor(private readonly jobRoleService: JobRoleService) {}

  @Post()
  async create(@Body() createJobRoleDto: CreateJobRoleDto): Promise<JobRole> {
    return this.jobRoleService.create(createJobRoleDto);
  }

  @Get()
  async findAll(
    @Query('jobFunctionId') jobFunctionId?: string,
  ): Promise<JobRole[]> {
    if (jobFunctionId) {
      return this.jobRoleService.findByJobFunction(jobFunctionId);
    }
    return this.jobRoleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobRole> {
    return this.jobRoleService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobRoleDto: UpdateJobRoleDto,
  ): Promise<JobRole> {
    return this.jobRoleService.update(id, updateJobRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobRoleService.remove(id);
  }
}
