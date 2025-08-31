import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JobTemplateService } from './job-template.service';
import { CreateJobTemplateDto, UpdateJobTemplateDto, JobTemplateResponseDto } from './dto/job-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('job-templates')
@UseGuards(JwtAuthGuard)
export class JobTemplateController {
  constructor(private readonly jobTemplateService: JobTemplateService) {}

  @Post()
  async create(@Body() createJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.create(createJobTemplateDto);
    return this.jobTemplateService.toResponseDto(template);
  }

  @Get()
  async findAll(): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplateService.findAll();
    return Promise.all(templates.map(template => this.jobTemplateService.toResponseDto(template)));
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplateService.findByRole(role);
    return Promise.all(templates.map(template => this.jobTemplateService.toResponseDto(template)));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.findOne(id);
    return this.jobTemplateService.toResponseDto(template);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateJobTemplateDto: UpdateJobTemplateDto
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.update(id, updateJobTemplateDto);
    return this.jobTemplateService.toResponseDto(template);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.jobTemplateService.remove(id);
    return { success: true };
  }
}
