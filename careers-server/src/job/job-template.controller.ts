import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobTemplateService } from './job-template.service';
import {
  CreateJobTemplateDto,
  UpdateJobTemplateDto,
  JobTemplateResponseDto,
} from './dto/job-template.dto';
import { JwtAuthGuard } from '../auth';

@Controller('job-templates')
@UseGuards(JwtAuthGuard)
export class JobTemplateController {
  constructor(private readonly jobTemplateService: JobTemplateService) {}

  @Post()
  async create(
    @Body() createJobTemplateDto: CreateJobTemplateDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.create(
      createJobTemplateDto,
      req.user.companyId,
    );
    return this.jobTemplateService.toResponseDto(template);
  }

  @Get()
  async findAll(
    @Request() req: { user: { companyId: string } },
  ): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplateService.findAll(req.user.companyId);
    return Promise.all(
      templates.map((template) =>
        this.jobTemplateService.toResponseDto(template),
      ),
    );
  }

  @Get('role/:role')
  async findByRole(
    @Param('role') role: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplateService.findByRole(
      role,
      req.user.companyId,
    );
    return Promise.all(
      templates.map((template) =>
        this.jobTemplateService.toResponseDto(template),
      ),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.findOne(
      id,
      req.user.companyId,
    );
    return this.jobTemplateService.toResponseDto(template);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobTemplateDto: UpdateJobTemplateDto,
    @Request() req: { user: { companyId: string } },
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.update(
      id,
      updateJobTemplateDto,
      req.user.companyId,
    );
    return this.jobTemplateService.toResponseDto(template);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ): Promise<{ success: boolean }> {
    await this.jobTemplateService.remove(id, req.user.companyId);
    return { success: true };
  }
}
