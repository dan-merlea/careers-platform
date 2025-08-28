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
import { JobFunctionService } from './job-function.service';
import { CreateJobFunctionDto } from './dto/create-job-function.dto';
import { UpdateJobFunctionDto } from './dto/update-job-function.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobFunction } from './job-function.model';

@Controller('job-functions')
@UseGuards(JwtAuthGuard)
export class JobFunctionController {
  constructor(private readonly jobFunctionService: JobFunctionService) {}

  @Post()
  async create(
    @Body() createJobFunctionDto: CreateJobFunctionDto,
  ): Promise<JobFunction> {
    return this.jobFunctionService.create(createJobFunctionDto);
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
  ): Promise<JobFunction[]> {
    if (companyId) {
      return this.jobFunctionService.findByCompany(companyId);
    }
    return this.jobFunctionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobFunction> {
    return this.jobFunctionService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobFunctionDto: UpdateJobFunctionDto,
  ): Promise<JobFunction> {
    return this.jobFunctionService.update(id, updateJobFunctionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.jobFunctionService.remove(id);
  }
}
